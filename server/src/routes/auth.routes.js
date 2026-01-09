const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

router.post("/signUp", ctrl.signUp);
router.post("/signIn", ctrl.signIn);

module.exports = router;
