// server/src/controllers/notification.controller.js
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getMyId = (req) => req.user?.userId || req.user?._id;

const toObjectId = (v) => {
    if (!v) return null;
    if (v instanceof mongoose.Types.ObjectId) return v;

    const s = String(v);
    if (!mongoose.Types.ObjectId.isValid(s)) return null;
    return new mongoose.Types.ObjectId(s);
};

exports.getMyNotifications = async (req, res) => {
    try {
        const myIdRaw = getMyId(req);
        const myId = toObjectId(myIdRaw);

        if (!myId) {
            return res.status(401).json({ message: "Invalid user" });
        }

        const list = await Notification.find({ recipients: myId })
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        return res.json({ metadata: { notifications: list } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Get notifications failed" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const myIdRaw = getMyId(req);
        const myId = toObjectId(myIdRaw);
        const notiId = toObjectId(req.params.id);

        if (!myId) return res.status(401).json({ message: "Invalid user" });
        if (!notiId) return res.status(400).json({ message: "Invalid id" });

        await Notification.updateOne(
            { _id: notiId, recipients: myId },
            { $addToSet: { readBy: myId } },
        );

        return res.json({ metadata: { ok: true } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Mark read failed" });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const myIdRaw = getMyId(req);
        const myId = toObjectId(myIdRaw);

        if (!myId) {
            return res.status(401).json({ message: "Invalid user" });
        }

        await Notification.updateMany(
            { recipients: myId },
            { $addToSet: { readBy: myId } },
        );

        return res.json({ metadata: { ok: true } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Mark all read failed" });
    }
};
