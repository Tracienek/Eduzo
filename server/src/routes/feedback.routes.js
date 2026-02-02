// server/src/routes/feedback.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/feedback.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Public submit from QR (no auth)
router.post("/public", ctrl.createPublic);

// Protected reads (teacher/center dashboard)
router.get("/class/:classId", authMiddleware, ctrl.listByClass);
router.get("/teacher/:teacherId", authMiddleware, ctrl.listByTeacher);

module.exports = router;
