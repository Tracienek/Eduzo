const Student = require("../models/Student");

// POST /v1/api/students
exports.createStudent = async (req, res) => {
    try {
        const { fullName, email, dob } = req.body;

        if (!fullName?.trim() || !email?.trim()) {
            return res
                .status(400)
                .json({ message: "fullName and email are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existed = await Student.findOne({
            email: normalizedEmail,
        }).lean();
        if (existed) {
            return res
                .status(409)
                .json({
                    message: "Student already exists",
                    metadata: { student: existed },
                });
        }

        const created = await Student.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            dob: dob || "",
            homework: false,
        });

        return res.status(201).json({ metadata: { student: created } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /v1/api/students
exports.getAll = async (req, res) => {
    try {
        const list = await Student.find().sort({ createdAt: -1 }).lean();
        return res.json({ metadata: { students: list } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /v1/api/students/:id
exports.getById = async (req, res) => {
    try {
        const st = await Student.findById(req.params.id).lean();
        if (!st) return res.status(404).json({ message: "Student not found" });
        return res.json({ metadata: { student: st } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PATCH /v1/api/students/:id
exports.update = async (req, res) => {
    try {
        const { fullName, dob, homework } = req.body;

        const update = {};
        if (typeof fullName === "string") update.fullName = fullName.trim();
        if (typeof dob === "string") update.dob = dob;
        if (typeof homework === "boolean") update.homework = homework;

        const st = await Student.findByIdAndUpdate(req.params.id, update, {
            new: true,
        }).lean();
        if (!st) return res.status(404).json({ message: "Student not found" });

        return res.json({ metadata: { student: st } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
