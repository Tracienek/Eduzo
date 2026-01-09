const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        dob: { type: String, default: "" },
        homework: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Student || mongoose.model("Student", StudentSchema);
