const Class = require("../models/Class");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

exports.getAvailable = async (req, res) => {
    try {
        const list = await Class.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        const now = Date.now();

        const classes = list.map((c) => {
            const until = c.onlineUntil ? new Date(c.onlineUntil).getTime() : 0;
            const isOnlineNow = !!c.isOnline && until > now;

            return {
                ...c,
                isOnline: isOnlineNow,
                totalStudents: c.students?.length || 0,
                studentCount: c.students?.length || 0,
            };
        });

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
            durationMinutes: Number(durationMinutes) || 90,
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
    const id = req.params.id;
    try {
        const cls = await Class.findById(req.params.id)
            .populate("students", "fullName email dob homework")
            .lean();

        if (!cls) return res.status(404).json({ message: "Class not found" });

        const now = Date.now();
        const until = cls.onlineUntil ? new Date(cls.onlineUntil).getTime() : 0;
        const isOnlineNow = cls.isOnline && until > now;

        return res.json({
            metadata: {
                class: {
                    ...cls,
                    totalStudents: cls.students?.length || 0,
                    studentCount: cls.students?.length || 0,
                    nextSessionDay: "Monday",
                    nextSessionTime: "Dec 30, 9:00 AM",
                    isOnline: isOnlineNow,
                    onlineUntil: cls.onlineUntil || null,
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
        // nên mình map tạm vào isOnline (hoặc bạn tạo field mới).
        const { isOnline } = req.body || {};
        if (typeof isOnline !== "boolean") {
            return res
                .status(400)
                .json({ message: "isOnline must be boolean" });
        }

        cls.isOnline = isOnline;
        await cls.save();

        return res.json({ metadata: { class: cls } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.pingOnline = async (req, res) => {
    try {
        const classId = req.params.id;

        const cls = await Class.findById(classId).lean();
        if (!cls) return res.status(404).json({ message: "Class not found" });

        const duration = Number(cls.durationMinutes) || 90;
        const onlineMinutes = Math.max(1, duration - 15);
        const onlineUntil = new Date(Date.now() + onlineMinutes * 60 * 1000);

        const updated = await Class.findByIdAndUpdate(
            classId,
            { $set: { isOnline: true, onlineUntil } },
            { new: true }
        ).lean();

        return res.json({
            metadata: { class: updated, onlineMinutes, onlineUntil },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const cls = await Class.findById(id);
        if (!cls) return res.status(404).json({ message: "Class not found" });

        // (optional) xóa attendance records của lớp
        // nếu bạn muốn sạch DB
        try {
            await Attendance.deleteMany({ classId: id });
        } catch (_) {}

        await Class.findByIdAndDelete(id);

        return res.json({ metadata: { deleted: true, classId: id } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
