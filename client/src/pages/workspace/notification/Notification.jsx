// client/src/pages/workspace/notification/Notification.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/AuthContext";
import {
    getMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../../../services/notificationService";
import "./Notification.css";

const getMyId = (userInfo) => userInfo?._id || userInfo?.userId;

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const myId = useMemo(() => getMyId(userInfo), [userInfo]);

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const refresh = async () => {
        try {
            setLoading(true);
            const list = await getMyNotifications();
            setItems(Array.isArray(list) ? list : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isRead = (n) =>
        myId ? (n.readBy || []).some((x) => String(x) === String(myId)) : false;

    const openNoti = async (n) => {
        if (!isRead(n)) {
            try {
                await markNotificationRead(n._id);
                setItems((prev) =>
                    prev.map((x) =>
                        x._id === n._id
                            ? { ...x, readBy: [...(x.readBy || []), myId] }
                            : x,
                    ),
                );
            } catch {
                // ignore
            }
        }

        if (n.classId) navigate(`/workspace/classes/${n.classId}`);
    };

    const markAll = async () => {
        await markAllNotificationsRead();
        if (myId) {
            setItems((prev) =>
                prev.map((x) => ({
                    ...x,
                    readBy: [...new Set([...(x.readBy || []), myId])],
                })),
            );
        }
    };

    return (
        <div className="noti-wrap">
            <div className="noti-head">
                <div className="noti-title">Notifications</div>

                <div className="noti-actions">
                    <button
                        type="button"
                        className="noti-btn"
                        onClick={refresh}
                        disabled={loading}
                    >
                        Refresh
                    </button>

                    <button
                        type="button"
                        className="noti-btn-primary"
                        onClick={markAll}
                        disabled={loading || !items.length}
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            {loading && <div className="noti-muted">Loading...</div>}

            {!loading && items.length === 0 && (
                <div className="noti-empty">No notifications yet</div>
            )}

            <div className="noti-list">
                {items.map((n) => {
                    const read = isRead(n);

                    return (
                        <button
                            type="button"
                            key={n._id}
                            className={`noti-item ${read ? "is-read" : "is-unread"}`}
                            onClick={() => openNoti(n)}
                            title={n.classId ? "Open class detail" : "Open"}
                        >
                            <div className="noti-item-top">
                                <div className="noti-item-time">
                                    {n.createdAt
                                        ? new Date(n.createdAt).toLocaleString()
                                        : ""}
                                </div>

                                {!read && (
                                    <span
                                        className="noti-dot"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            {!!n.className && (
                                <div className="noti-item-sub">
                                    Class: {n.className}
                                </div>
                            )}

                            <div className="noti-item-content">{n.content}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
