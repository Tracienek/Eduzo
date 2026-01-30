// src/pages/workspace/classes/classDetail/NotesPanel/NotesPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { apiUtils } from "../../../../../utils/newRequest";
import "./NotesPanel.css";
import "../ClassDetailPage.css";

const getMyId = (userInfo) => userInfo?._id || userInfo?.userId;

const pad2 = (n) => String(n).padStart(2, "0");

// Force DD/MM/YYYY (optionally with HH:MM) regardless of system locale
const formatDDMMYYYY_HHMM = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";

    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());

    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

export default function NotesPanel({
    classId,
    role,
    userInfo,
    classNameValue = "",
}) {
    const canUseNotes = role === "teacher" || role === "center";
    const myId = useMemo(() => getMyId(userInfo), [userInfo]);

    const [notes, setNotes] = useState([]);
    const [noteText, setNoteText] = useState("");
    const [noteLoading, setNoteLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotes = async () => {
        if (!classId || !canUseNotes) return;

        try {
            setLoading(true);
            const res = await apiUtils.get(`/classes/${classId}/notes`);
            const list =
                res?.data?.metadata?.notes ||
                res?.data?.notes ||
                res?.data?.metadata ||
                [];
            setNotes(Array.isArray(list) ? list : []);
        } catch {
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, canUseNotes]);

    const submitNote = async () => {
        if (!canUseNotes) return;

        const content = noteText.trim();
        if (!content) {
            alert("content is required");
            return;
        }

        const toRole = role === "teacher" ? "center" : "teacher";

        if (role === "teacher" && !userInfo?.centerId) {
            alert("centerId is missing on this account");
            return;
        }

        try {
            setNoteLoading(true);

            const res = await apiUtils.post(`/classes/${classId}/notes`, {
                content,
                toRole,
            });

            const created =
                res?.data?.metadata?.note || res?.data?.note || null;

            const fallback = {
                _id: `tmp-${Date.now()}`,
                classId,
                content,
                fromRole: role,
                toRole,
                fromUserId: myId,
                createdAt: new Date().toISOString(),
            };

            setNotes((prev) => [created || fallback, ...prev]);
            setNoteText("");
        } catch (e) {
            alert(e?.response?.data?.message || "Send note failed");
        } finally {
            setNoteLoading(false);
        }
    };

    if (!canUseNotes) return null;

    return (
        <div className="cd-section">
            <div className="cd-section-head">
                <h2>Notes </h2>
            </div>

            <div className="cd-note-box">
                <textarea
                    className="cd-note-input"
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={
                        role === "teacher"
                            ? "Write a note for Center (shows in Center notifications)..."
                            : "Write a note for Teacher (shows in Teachers notifications)..."
                    }
                />

                <div className="cd-note-actions">
                    <button
                        type="button"
                        className="cd-btn"
                        onClick={submitNote}
                        disabled={!noteText.trim() || noteLoading}
                    >
                        {noteLoading ? "Sending..." : "Send note"}
                    </button>

                    {/* <button
                        type="button"
                        className="cd-btn"
                        onClick={fetchNotes}
                        disabled={noteLoading}
                        style={{ marginLeft: 10 }}
                        title="Refresh notes"
                    >
                        Refresh
                    </button> */}
                </div>
            </div>

            <div className="cd-note-list">
                {loading && (
                    <div className="cd-empty" style={{ marginTop: 10 }}>
                        Loading...
                    </div>
                )}

                {!loading && notes.length === 0 && (
                    <div className="cd-empty" style={{ marginTop: 10 }}>
                        No notes yet
                    </div>
                )}

                {!loading &&
                    notes.map((n) => (
                        <div className="cd-note-item" key={n._id}>
                            <div className="cd-note-meta">
                                {!!classNameValue && !!n.classId && (
                                    <div className="cd-note-sub">
                                        Class: {classNameValue}
                                    </div>
                                )}
                                <span className="cd-note-time">
                                    {formatDDMMYYYY_HHMM(n?.createdAt)}
                                </span>
                            </div>

                            <div className="cd-note-msg">{n.content || ""}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
