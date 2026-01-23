// server/src/routes/attendance.routes.js

const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");

// PATCH /classes/:id/attendance/bulk
router.patch("/:id/attendance/bulk", classController.bulkSaveAttendance);

module.exports = router;
