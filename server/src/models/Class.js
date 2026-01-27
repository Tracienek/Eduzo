// server/src/models/Class.js

const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
    {
        name: String,
        subject: String,
        scheduleText: String,
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

        isActive: { type: Boolean, default: true, index: true },

        isOnline: { type: Boolean, default: false, index: true },
        onlineUntil: { type: Date, default: null, index: true },

        durationMinutes: { type: Number, default: 90 },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Class || mongoose.model("Class", ClassSchema);
