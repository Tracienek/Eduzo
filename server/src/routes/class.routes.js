const router = require("express").Router();
const ctrl = require("../controllers/class.controller");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/available", ctrl.getAvailable);
router.post("/", ctrl.createClass);
router.get("/:id", ctrl.getById);
router.patch("/:id/online", ctrl.setOnline);

router.post("/:id/students", ctrl.addStudentToClass);

router.patch("/:id/attendance/bulk", attendanceController.bulkSaveAttendance);

module.exports = router;
