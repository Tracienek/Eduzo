// server/src/controllers/feedback.controller.js
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Class = require("../models/Class");

const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v || ""));

const ok = (res, metadata, message = "OK") =>
    res.status(200).json({ message, metadata });

const bad = (res, message = "Bad request", code = 400) =>
    res.status(code).json({ message });

/**
 * Public create (no auth) - students submit feedback from QR form
 * POST /feedback/public
 * body: { classId, studentName, studentId?, rating, comment?, teacherId?, className?, teacherName? }
 */
exports.createPublic = async (req, res) => {
    try {
        const {
            classId,
            studentName,
            studentId,
            rating,
            comment,
            teacherId,
            className,
            teacherName,
        } = req.body || {};

        if (!isValidObjectId(classId)) return bad(res, "Invalid classId");

        const sn = String(studentName || "").trim();
        if (!sn) return bad(res, "Student name is required");

        const r = Number(rating);
        if (!(r >= 1 && r <= 5)) return bad(res, "Rating must be 1 to 5");

        // verify class exists
        const klass =
            await Class.findById(classId).select("_id name className");
        if (!klass) return bad(res, "Class not found", 404);

        // optional IDs
        const sid = isValidObjectId(studentId) ? studentId : null;
        const tid = isValidObjectId(teacherId) ? teacherId : null;

        const fb = await Feedback.create({
            classId,
            studentId: sid,
            teacherId: tid,
            studentName: sn,
            rating: r,
            comment: String(comment || "")
                .trim()
                .slice(0, 1200),
            className:
                String(className || "").trim() ||
                String(klass.name || klass.className || "").trim(),
            teacherName: String(teacherName || "").trim(),
            source: "qr",
            ip: String(
                req.headers["x-forwarded-for"] ||
                    req.socket?.remoteAddress ||
                    "",
            ),
            userAgent: String(req.headers["user-agent"] || ""),
        });

        return ok(res, { feedback: fb }, "Feedback submitted");
    } catch (err) {
        console.error("createPublic feedback error:", err);
        return bad(res, "Failed to submit feedback", 500);
    }
};

/**
 * List feedback by class (should be protected for teacher/center pages)
 * GET /feedback/class/:classId
 */
exports.listByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        if (!isValidObjectId(classId)) return bad(res, "Invalid classId");

        const limit = Math.min(Number(req.query.limit || 50), 200);
        const items = await Feedback.find({ classId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return ok(res, { feedbacks: items }, "OK");
    } catch (err) {
        console.error("listByClass feedback error:", err);
        return bad(res, "Failed to load feedback", 500);
    }
};

/**
 * List feedback by teacher
 * GET /feedback/teacher/:teacherId
 */
exports.listByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        if (!isValidObjectId(teacherId)) return bad(res, "Invalid teacherId");

        const limit = Math.min(Number(req.query.limit || 50), 200);

        const items = await Feedback.find({ teacherId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return ok(res, { feedbacks: items }, "OK");
    } catch (err) {
        console.error("listByTeacher feedback error:", err);
        return bad(res, "Failed to load feedback", 500);
    }
};
