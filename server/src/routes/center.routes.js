// routes/center.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/center.controller");

router.get("/teachers", auth, ctrl.getTeachers);
router.post("/teachers", auth, ctrl.createTeacher);
router.delete("/teachers/:id", auth, ctrl.deleteTeacher);

module.exports = router;
