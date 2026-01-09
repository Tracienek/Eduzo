const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, ctrl.me);

module.exports = router;
