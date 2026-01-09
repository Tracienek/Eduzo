const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
    {
        name: String,
        subject: String,
        scheduleText: String,
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
        isActive: { type: Boolean, default: true },
        durationMinutes: { type: Number, default: 90 },
        // activeUntil: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Class || mongoose.model("Class", ClassSchema);
