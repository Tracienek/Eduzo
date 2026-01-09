const User = require("../models/User");

exports.me = async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select("email fullName role")
        .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ metadata: { user } });
};
