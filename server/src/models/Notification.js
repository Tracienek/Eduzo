// server/src/models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },

        classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
        className: { type: String, default: "" },

        // ai nhận
        recipients: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        ],

        // ai đã đọc
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true },
);

NotificationSchema.index({ recipients: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
