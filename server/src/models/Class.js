// server/src/models/Class.js

const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
    {
        name: String,
        subject: String,
        scheduleText: String,
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
            default: null,
        },

        isActive: { type: Boolean, default: true, index: true },

        isOnline: { type: Boolean, default: false, index: true },
        onlineUntil: { type: Date, default: null, index: true },

        durationMinutes: { type: Number, default: 90 },
        tuitionMilestoneNotifiedAt: { type: Date, default: null },
        tuitionEmailSentAt: { type: Date, default: null },
        tuitionMilestoneNotifiedAt: { type: Date, default: null },
        tuitionEmailSentAt: { type: Date, default: null },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Class || mongoose.model("Class", ClassSchema);
