const Attendance = require("../models/Attendance");

exports.getByDates = async (req, res) => {
    try {
        const classId = req.params.id;
        const dates = String(req.query.dates || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

        if (!dates.length) return res.json({ metadata: { records: [] } });

        const records = await Attendance.find({
            classId,
            dateKey: { $in: dates },
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
        const changes = Array.isArray(req.body?.changes)
            ? req.body.changes
            : [];

        if (!changes.length) return res.json({ metadata: { saved: 0 } });

        const ops = changes
            .filter((c) => c?.studentId && c?.dateKey)
            .map((c) => ({
                updateOne: {
                    filter: {
                        classId,
                        studentId: c.studentId,
                        dateKey: c.dateKey,
                    },
                    update: { $set: { attendance: !!c.attendance } },
                    upsert: true,
                },
            }));

        if (!ops.length) {
            return res.status(400).json({ message: "Invalid changes payload" });
        }

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
