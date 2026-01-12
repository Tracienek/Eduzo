const router = require("express").Router();
const ctrl = require("../controllers/class.controller");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const noteCtrl = require("../controllers/classNote.controller");

router.get("/available", ctrl.getAvailable);
router.post("/", ctrl.createClass);

router.get("/:id", ctrl.getById);
router.patch("/:id/online", ctrl.setOnline);
router.post("/:id/online/ping", ctrl.pingOnline);
router.post("/:id/students", ctrl.addStudentToClass);

router.get("/:id/attendance/range", attendanceController.getByRange);
router.get("/:id/attendance", attendanceController.getByDates);
router.patch("/:id/attendance/bulk", attendanceController.bulkSaveAttendance);

router.delete("/:id", ctrl.deleteClass);

router.get("/:id/notes", authMiddleware, noteCtrl.listByClass);
router.post("/:id/notes", authMiddleware, noteCtrl.create);

module.exports = router;
