const router = require("express").Router();

router.get("/", (req, res) => res.send("EDUZO API OK"));

router.use("/auth", require("./auth.routes"));
router.use("/user", require("./user.routes"));
router.use("/classes", require("./class.routes"));
router.use("/students", require("./student.routes"));
router.use("/search", require("./search.routes"));

module.exports = router;
