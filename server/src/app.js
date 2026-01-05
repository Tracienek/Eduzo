require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

/* ===== CONNECT MONGODB ===== */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("Mongo error:", err.message));

/* ===== MODELS ===== */
const ClassSchema = new mongoose.Schema(
    {
        name: String,
        subject: String,
        scheduleText: String,
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Class = mongoose.models.Class || mongoose.model("Class", ClassSchema);

const StudentSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        dob: String,
        homework: Boolean,
    },
    { timestamps: true }
);

const Student =
    mongoose.models.Student || mongoose.model("Student", StudentSchema);

/* ===== ROUTES ===== */
app.get("/", (req, res) => res.send("EDUZO API OK"));

app.get("/v1/api/classes/available", async (req, res) => {
    try {
        const list = await Class.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        const classes = list.map((c) => ({
            ...c,
            totalStudents: c.students?.length || 0,
            studentCount: c.students?.length || 0,
        }));

        res.json({ metadata: { classes } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/v1/api/classes/:id", async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id)
            .populate("students", "fullName email dob homework")
            .lean();

        if (!cls) return res.status(404).json({ message: "Class not found" });

        res.json({
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
        res.status(500).json({ message: err.message });
    }
});

app.get("/v1/api/search", async (req, res) => {
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
                .select("name subject folderId folderName scheduleText")
                .lean(),
        ]);

        res.json({ metadata: { students, classes } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = app;
