const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },
        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        className: { type: String, default: "" },

        studentName: { type: String, default: "" },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        teacherName: { type: String, default: "" },

        rating: { type: Number, min: 1, max: 5, default: 5 },
        understand: { type: Number, min: 1, max: 5, default: 5 },
        teachingWay: { type: Number, min: 1, max: 5, default: 5 },

        message: { type: String, required: true, trim: true },
    },
    { timestamps: true },
);

FeedbackSchema.index({ classId: 1, createdAt: -1 });
FeedbackSchema.index({ centerId: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);
