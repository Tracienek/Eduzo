// src/pages/workspace/classes/classDetail/FeedbackPanel/FeedbackPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { apiUtils } from "../../../../../utils/newRequest";
import QRCode from "qrcode";
import "./FeedbackPanel.css";

export default function FeedbackPanel({ classId, role }) {
    const canView =
        role === "teacher" || role === "center" || role === "student";
    const isStudent = role === "student";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [text, setText] = useState("");
    const [rating, setRating] = useState(5);
    const [sending, setSending] = useState(false);

    /** ===== QR ===== */
    const [qrOpen, setQrOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [qrLoading, setQrLoading] = useState(false);

    const feedbackLink = useMemo(() => {
        return `${window.location.origin}/feedback/${classId}`;
    }, [classId]);

    const buildQR = async () => {
        if (!feedbackLink) return;
        if (qrDataUrl) return; // already generated

        try {
            setQrLoading(true);
            const url = await QRCode.toDataURL(feedbackLink, {
                width: 320,
                margin: 1,
            });
            setQrDataUrl(url);
        } catch {
            setQrDataUrl("");
        } finally {
            setQrLoading(false);
        }
    };

    const openQR = async () => {
        setQrOpen(true);
        await buildQR();
    };

    const refresh = async () => {
        if (!classId || !canView) return;
        try {
            setLoading(true);
            const res = await apiUtils.get(`/classes/${classId}/feedbacks`);
            const list =
                res?.data?.metadata?.feedbacks ||
                res?.data?.feedbacks ||
                res?.data?.metadata ||
                [];
            setItems(Array.isArray(list) ? list : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, canView]);

    const submit = async () => {
        if (!isStudent) return;

        const content = String(text || "").trim();
        if (!content) {
            alert("feedback is required");
            return;
        }

        try {
            setSending(true);
            const res = await apiUtils.post(`/classes/${classId}/feedbacks`, {
                content,
                rating: Number(rating) || 5,
            });

            const created =
                res?.data?.metadata?.feedback || res?.data?.feedback || null;

            const fallback = {
                _id: `tmp-${Date.now()}`,
                content,
                rating: Number(rating) || 5,
                createdAt: new Date().toISOString(),
            };

            setItems((prev) => [created || fallback, ...prev]);
            setText("");
            setRating(5);
        } catch (e) {
            alert(e?.response?.data?.message || "Send feedback failed");
        } finally {
            setSending(false);
        }
    };

    if (!canView) return null;

    return (
        <div className="cd-section">
            <div className="cd-section-head">
                <h2>Feedback</h2>

                <div className="cd-fb-actions">
                    <button
                        type="button"
                        className="cd-btn"
                        onClick={refresh}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* ===== QR BOX: only teacher/center ===== */}
            {(role === "teacher" || role === "center") && (
                <>
                    <button
                        type="button"
                        className="cd-qr-box"
                        onClick={openQR}
                        title="Open QR code for students to give feedback"
                    >
                        <div className="cd-qr-left">
                            <div className="cd-qr-title">QR Code</div>
                            <div className="cd-qr-sub">
                                Students scan to give feedback
                            </div>
                        </div>

                        <div className="cd-qr-right">
                            <div className="cd-qr-badge">
                                {qrDataUrl ? "Ready" : "Open"}
                            </div>
                        </div>
                    </button>

                    {qrOpen && (
                        <div
                            className="cd-qr-overlay"
                            role="button"
                            tabIndex={0}
                            onClick={() => setQrOpen(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setQrOpen(false);
                            }}
                        >
                            <div
                                className="cd-qr-modal"
                                role="dialog"
                                aria-modal="true"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="cd-qr-modal-head">
                                    <div className="cd-qr-modal-title">
                                        Feedback QR Code
                                    </div>
                                    <button
                                        type="button"
                                        className="cd-qr-close"
                                        onClick={() => setQrOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="cd-qr-modal-body">
                                    {qrLoading && (
                                        <div className="cd-muted">
                                            Generating QR...
                                        </div>
                                    )}

                                    {!qrLoading && !!qrDataUrl && (
                                        <img
                                            className="cd-qr-img"
                                            src={qrDataUrl}
                                            alt="Feedback QR"
                                        />
                                    )}

                                    {!qrLoading && !qrDataUrl && (
                                        <div className="cd-muted">
                                            Failed to generate QR
                                        </div>
                                    )}

                                    {/* keep link hidden but usable if needed */}
                                    <div className="cd-qr-link">
                                        {feedbackLink}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ===== student form ===== */}
            {isStudent && (
                <div className="cd-fb-box">
                    <div className="cd-fb-formrow">
                        <div className="cd-fb-label">Rating</div>
                        <select
                            className="cd-fb-select"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        >
                            <option value={5}>5 - Excellent</option>
                            <option value={4}>4 - Good</option>
                            <option value={3}>3 - Ok</option>
                            <option value={2}>2 - Bad</option>
                            <option value={1}>1 - Very bad</option>
                        </select>
                    </div>

                    <textarea
                        className="cd-fb-input"
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write your feedback..."
                    />

                    <div className="cd-fb-sendrow">
                        <button
                            type="button"
                            className="cd-btn"
                            onClick={submit}
                            disabled={!text.trim() || sending}
                        >
                            {sending ? "Sending..." : "Send feedback"}
                        </button>
                    </div>
                </div>
            )}

            {/* ===== list ===== */}
            <div className="cd-fb-list">
                {!loading && items.length === 0 && (
                    <div className="cd-empty" style={{ marginTop: 10 }}>
                        No feedback yet
                    </div>
                )}

                {items.map((f) => (
                    <div className="cd-fb-item" key={f._id}>
                        <div className="cd-fb-meta">
                            <span className="cd-fb-rating">
                                Rating: {f.rating ?? "—"}/5
                            </span>
                            <span className="cd-fb-time">
                                {f?.createdAt
                                    ? new Date(f.createdAt).toLocaleString()
                                    : ""}
                            </span>
                        </div>

                        <div className="cd-fb-msg">{f.content || ""}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
