const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const TUITION_KEY = "__TUITION__";

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

        // lấy dates + tuition record
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

        if (!ops.length) return res.json({ metadata: { saved: 0 } });

        const result = await Attendance.bulkWrite(ops, { ordered: false });

        return res.json({
            metadata: {
                saved:
                    (result?.modifiedCount || 0) + (result?.upsertedCount || 0),
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
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(to)
        ) {
            return res
                .status(400)
                .json({ message: "from/to must be YYYY-MM-DD" });
        }

        // lấy cả attendance trong khoảng ngày + tuition record (dateKey đặc biệt)
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
