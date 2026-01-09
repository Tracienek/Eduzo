const Class = require("../models/Class");
const Student = require("../models/Student");

exports.getAvailable = async (req, res) => {
    try {
        const list = await Class.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        const classes = list.map((c) => ({
            ...c,
            totalStudents: c.students?.length || 0,
            studentCount: c.students?.length || 0,
        }));

        return res.json({ metadata: { classes } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.createClass = async (req, res) => {
    try {
        const { name, subject, scheduleText, durationMinutes } = req.body;

        if (!name?.trim() || !subject?.trim()) {
            return res
                .status(400)
                .json({ message: "name and subject are required" });
        }

        const created = await Class.create({
            name: name.trim(),
            subject: subject.trim(),
            scheduleText: scheduleText?.trim() || "",
            durationMinutes: Number(durationMinutes) || 90, // ✅ default 90
            students: [],
            isActive: true,
        });

        return res.status(201).json({
            metadata: {
                class: {
                    ...created.toObject(),
                    totalStudents: 0,
                    studentCount: 0,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id)
            .populate("students", "fullName email dob homework")
            .lean();

        if (!cls) return res.status(404).json({ message: "Class not found" });

        return res.json({
            metadata: {
                class: {
                    ...cls,
                    totalStudents: cls.students?.length || 0,
                    studentCount: cls.students?.length || 0,
                    nextSessionDay: "Monday",
                    nextSessionTime: "Dec 30, 9:00 AM",
                },
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.addStudentToClass = async (req, res) => {
    try {
        const { fullName, email, dob } = req.body;
        const classId = req.params.id;

        if (!fullName?.trim() || !email?.trim()) {
            return res
                .status(400)
                .json({ message: "fullName and email are required" });
        }

        const cls = await Class.findById(classId);
        if (!cls) return res.status(404).json({ message: "Class not found" });

        const normalizedEmail = email.trim().toLowerCase();

        const existedStudent = await Student.findOne({
            email: normalizedEmail,
        }).lean();

        let studentDoc;
        if (existedStudent) {
            studentDoc = existedStudent;
        } else {
            studentDoc = await Student.create({
                fullName: fullName.trim(),
                email: normalizedEmail,
                dob: dob || "",
                homework: false,
            });
        }

        const sid = String(studentDoc._id);
        const has = (cls.students || []).some((x) => String(x) === sid);
        if (!has) cls.students.push(studentDoc._id);
        await cls.save();

        return res.status(201).json({
            metadata: {
                student: studentDoc,
                class: {
                    _id: cls._id,
                    totalStudents: cls.students.length,
                    studentCount: cls.students.length,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.setOnline = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id);
        if (!cls) return res.status(404).json({ message: "Class not found" });

        // bạn muốn online nghĩa là gì thì set ở đây.
        // Hiện schema Class của bạn không có field "online",
        // nên mình map tạm vào isActive (hoặc bạn tạo field mới).
        const { isActive } = req.body || {};
        if (typeof isActive !== "boolean") {
            return res
                .status(400)
                .json({ message: "isActive must be boolean" });
        }

        cls.isActive = isActive;
        await cls.save();

        return res.json({ metadata: { class: cls } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
