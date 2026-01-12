const ClassNote = require("../models/ClassNote");

exports.listByClass = async (req, res) => {
    try {
        const classId = req.params.id;

        const notes = await ClassNote.find({ classId })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ metadata: { notes } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const classId = req.params.id;
        const { content, toRole } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: "content is required" });
        }

        // ✅ MUST come from authMiddleware
        const fromUserId = req.user?._id || req.user?.id;
        const fromRole = req.user?.role;

        if (!fromUserId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        // optional validate toRole
        const allowed = ["teacher", "center", "student"];
        if (toRole && !allowed.includes(toRole)) {
            return res.status(400).json({ message: "Invalid toRole" });
        }

        const created = await ClassNote.create({
            classId,
            content: content.trim(),
            fromUserId,
            fromRole,
            toRole: toRole || null,
        });

        return res.status(201).json({ metadata: { note: created } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
