const Student = require("../models/Student");
const Class = require("../models/Class");

exports.search = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q) return res.json({ metadata: { students: [], classes: [] } });

        const regex = new RegExp(q, "i");

        const [students, classes] = await Promise.all([
            Student.find({ $or: [{ fullName: regex }, { email: regex }] })
                .limit(8)
                .select("fullName classId className folderId")
                .lean(),
            Class.find({ $or: [{ name: regex }, { subject: regex }] })
                .limit(8)
                .select(
                    "name subject folderId folderName scheduleText durationMinutes"
                )
                .lean(),
        ]);

        return res.json({ metadata: { students, classes } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
