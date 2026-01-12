const mongoose = require("mongoose");

const ClassNoteSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },

        fromRole: {
            type: String,
            enum: ["teacher", "center"],
            required: true,
            index: true,
        },
        toRole: {
            type: String,
            enum: ["teacher", "center"],
            required: true,
            index: true,
        },

        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: { type: String, required: true, trim: true, maxlength: 1000 },

        isRead: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.ClassNote || mongoose.model("ClassNote", ClassNoteSchema);
