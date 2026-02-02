// server/src/models/Feedback.js
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },

        // optional: if feedback is for a teacher
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // optional: who submitted (if we can map to a Student)
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null,
            index: true,
        },

        studentName: { type: String, required: true, trim: true },

        // 1 -> 5
        rating: { type: Number, required: true, min: 1, max: 5 },

        comment: { type: String, default: "", trim: true, maxlength: 1200 },

        // metadata
        className: { type: String, default: "", trim: true },
        teacherName: { type: String, default: "", trim: true },
        source: { type: String, default: "qr", trim: true }, // "qr" | "web" ...
        ip: { type: String, default: "" },
        userAgent: { type: String, default: "" },
    },
    { timestamps: true },
);

module.exports =
    mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
