const Class = require("../models/Class");
const User = require("../models/User");
const Feedback = require("../models/Feedback");

exports.getPublicMeta = async (req, res) => {
    try {
        const { classId } = req.params;

        const klass = await Class.findById(classId).lean();
        if (!klass) return res.status(404).json({ message: "Class not found" });

        const centerId = klass.centerId || klass.ownerId || null;
        if (!centerId) {
            return res
                .status(400)
                .json({ message: "centerId is missing on this class" });
        }

        const teachers = await User.find({ role: "teacher", centerId })
            .select("_id fullName email")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            metadata: {
                classId,
                className: klass.name || klass.className || "",
                centerId,
                teachers: teachers.map((t) => ({
                    id: t._id,
                    name: t.fullName || t.email,
                })),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Get feedback meta failed" });
    }
};

exports.submitPublic = async (req, res) => {
    try {
        const { classId } = req.params;

        const klass = await Class.findById(classId).lean();
        if (!klass) return res.status(404).json({ message: "Class not found" });

        const centerId = klass.centerId || klass.ownerId || null;
        if (!centerId) {
            return res
                .status(400)
                .json({ message: "centerId is missing on this class" });
        }

        const {
            studentName,
            teacherId,
            rating,
            understand,
            teachingWay,
            message,
        } = req.body || {};

        const text = String(message || "").trim();
        if (!teacherId)
            return res.status(400).json({ message: "teacherId is required" });
        if (!text)
            return res.status(400).json({ message: "message is required" });

        const teacher = await User.findOne({
            _id: teacherId,
            role: "teacher",
            centerId,
        })
            .select("_id fullName email")
            .lean();

        if (!teacher)
            return res.status(400).json({ message: "Invalid teacherId" });

        const doc = await Feedback.create({
            classId,
            centerId,
            className: klass.name || klass.className || "",
            studentName: String(studentName || "").trim(),
            teacherId: teacher._id,
            teacherName: teacher.fullName || teacher.email,
            rating: Number(rating) || 5,
            understand: Number(understand) || 5,
            teachingWay: Number(teachingWay) || 5,
            message: text,
        });

        return res.status(201).json({ metadata: { feedback: doc } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Submit feedback failed" });
    }
};
