// routes/center.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/center.controller");

router.get("/teachers", auth, ctrl.getTeachers);
router.post("/teachers", auth, ctrl.createTeacher);

module.exports = router;
