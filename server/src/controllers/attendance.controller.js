// server/src/controllers/attendance.controller.js
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const ClassSession = require("../models/ClassSession");
const ClassModel = require("../models/Class");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const TUITION_KEY = "__TUITION__";
const TUITION_THRESHOLD = 12;

// Helper: validate YYYY-MM-DD
const isISODateKey = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

exports.getByDates = async (req, res) => {
    try {
        const classId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid classId" });
        }
        const classObjectId = new mongoose.Types.ObjectId(classId);

        const dates = String(req.query.dates || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

        // get requested dates + tuition special record
        const records = await Attendance.find({
            classId: classObjectId,
            dateKey: { $in: [...dates, TUITION_KEY] },
        })
            .select("studentId dateKey attendance homework tuition")
            .lean();

        return res.json({ metadata: { records } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.bulkSaveAttendance = async (req, res) => {
    try {
        const classId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid classId" });
        }
        const classObjectId = new mongoose.Types.ObjectId(classId);

        const changes = Array.isArray(req.body?.changes)
            ? req.body.changes
            : [];
        const tuitionChanges = Array.isArray(req.body?.tuitionChanges)
            ? req.body.tuitionChanges
            : [];

        const ops = [];

        // attendance + homework per date
        for (const c of changes) {
            if (!c?.studentId || !c?.dateKey) continue;

            // protect against invalid dateKey format (optional)
            if (c.dateKey !== TUITION_KEY && !isISODateKey(c.dateKey)) continue;

            const set = {};
            if (typeof c.attendance === "boolean")
                set.attendance = c.attendance;
            if (typeof c.homework === "boolean") set.homework = c.homework;

            if (!Object.keys(set).length) continue;

            ops.push({
                updateOne: {
                    filter: {
                        classId: classObjectId,
                        studentId: c.studentId,
                        dateKey: c.dateKey,
                    },
                    update: {
                        $set: set,
                        $setOnInsert: {
                            classId: classObjectId,
                            studentId: c.studentId,
                            dateKey: c.dateKey,
                        },
                    },
                    upsert: true,
                },
            });
        }

        // tuition (special record)
        for (const t of tuitionChanges) {
            if (!t?.studentId) continue;

            ops.push({
                updateOne: {
                    filter: {
                        classId: classObjectId,
                        studentId: t.studentId,
                        dateKey: TUITION_KEY,
                    },
                    update: {
                        $set: { tuition: !!t.tuition },
                        $setOnInsert: {
                            classId: classObjectId,
                            studentId: t.studentId,
                            dateKey: TUITION_KEY,
                        },
                    },
                    upsert: true,
                },
            });
        }

        if (!ops.length) {
            // still return heldCount so FE can show correct state
            const heldCount = await ClassSession.countDocuments({
                classId: classObjectId,
                held: true,
            });

            return res.json({ metadata: { saved: 0, heldCount } });
        }

        // count before (to detect "crossing" 12)
        const heldCountBefore = await ClassSession.countDocuments({
            classId: classObjectId,
            held: true,
        });

        const result = await Attendance.bulkWrite(ops, { ordered: false });

        // 1) Determine which dateKeys were edited (exclude tuition)
        const changedDateKeys = Array.from(
            new Set(
                changes
                    .map((c) => String(c?.dateKey || "").trim())
                    .filter(
                        (dk) => dk && dk !== TUITION_KEY && isISODateKey(dk),
                    ),
            ),
        );

        // 2) Mark session as held ONLY if any student has attendance=true OR homework=true for that dateKey
        if (changedDateKeys.length) {
            const heldDateKeys = [];

            // NOTE: simple loop, safe and clear
            for (const dk of changedDateKeys) {
                const anyTrue = await Attendance.exists({
                    classId: classObjectId,
                    dateKey: dk,
                    $or: [{ attendance: true }, { homework: true }],
                });

                if (anyTrue) heldDateKeys.push(dk);
            }

            if (heldDateKeys.length) {
                const sessionOps = heldDateKeys.map((dk) => ({
                    updateOne: {
                        filter: { classId: classObjectId, dateKey: dk },
                        update: {
                            $set: { held: true },
                            $setOnInsert: {
                                classId: classObjectId,
                                dateKey: dk,
                            },
                        },
                        upsert: true,
                    },
                }));

                await ClassSession.bulkWrite(sessionOps, { ordered: false });
            }
        }

        // 3) Recount held sessions after updates
        const heldCountAfter = await ClassSession.countDocuments({
            classId: classObjectId,
            held: true,
        });

        // 4) Send ONLY the center milestone email ONCE when crossing threshold
        //    - "system just send email for center to announce reach 12 sessions"
        const crossedThreshold =
            heldCountBefore < TUITION_THRESHOLD &&
            heldCountAfter >= TUITION_THRESHOLD;

        if (crossedThreshold) {
            const klass = await ClassModel.findById(classObjectId)
                .select("centerId tuitionMilestoneNotifiedAt name")
                .lean();

            // send once only
            if (klass?.centerId && !klass.tuitionMilestoneNotifiedAt) {
                const center = await User.findById(klass.centerId)
                    .select("email")
                    .lean();

                if (center?.email) {
                    try {
                        await sendMail({
                            to: center.email,
                            subject: `Class reached ${TUITION_THRESHOLD} sessions (${klass.name || "Class"})`,
                            text: `This class "${klass.name || "Class"}" has reached ${TUITION_THRESHOLD} held sessions. You can now send tuition emails.`,
                        });

                        await ClassModel.updateOne(
                            { _id: classObjectId },
                            {
                                $set: {
                                    tuitionMilestoneNotifiedAt: new Date(),
                                },
                            },
                        );
                    } catch (e) {
                        // do not fail attendance save if email fails
                        console.error("Milestone email failed:", e.message);
                    }
                }
            }
        }

        return res.json({
            metadata: {
                saved:
                    (result?.modifiedCount || 0) + (result?.upsertedCount || 0),
                heldCount: heldCountAfter,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getByRange = async (req, res) => {
    try {
        const classId = req.params.id;
        const from = String(req.query.from || "").trim();
        const to = String(req.query.to || "").trim();

        // validate basic ISO YYYY-MM-DD
        if (!isISODateKey(from) || !isISODateKey(to)) {
            return res
                .status(400)
                .json({ message: "from/to must be YYYY-MM-DD" });
        }

        // get attendance in date range + tuition special record
        const records = await Attendance.find({
            classId,
            $or: [
                { dateKey: { $gte: from, $lte: to } },
                { dateKey: TUITION_KEY },
            ],
        })
            .select("studentId dateKey attendance homework tuition")
            .lean();

        return res.json({ metadata: { records } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
