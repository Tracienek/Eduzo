// server/src/routes/notification.routes.js

const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/notification.controller");

router.get("/", auth, ctrl.getMyNotifications);
router.patch("/:id/read", auth, ctrl.markRead);
router.patch("/read-all", auth, ctrl.markAllRead);

module.exports = router;
