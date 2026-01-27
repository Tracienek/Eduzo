const router = require("express").Router();
const ctrl = require("../controllers/feedback.controller");

// public QR
router.get("/public/:classId", ctrl.getPublicMeta);
router.post("/public/:classId", ctrl.submitPublic);

module.exports = router;
