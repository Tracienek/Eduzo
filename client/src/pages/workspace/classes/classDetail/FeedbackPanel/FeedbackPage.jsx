// src/pages/feedback/FeedbackPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUtils } from "../../../../../utils/newRequest";
import "./FeedbackPage.css";

export default function FeedbackPage() {
    const { classId } = useParams();
    const cid = useMemo(() => String(classId || "").trim(), [classId]);

    // from BE
    const [className, setClassName] = useState("");
    const [teachers, setTeachers] = useState([]);

    // student name input (public)
    const [studentName, setStudentName] = useState("");

    // section 1: rate
    const [rating, setRating] = useState(5);

    // section 2: choose teacher
    const [teacherId, setTeacherId] = useState("");

    // section 3: understand
    const [understand, setUnderstand] = useState(5);

    // section 4: teaching way
    const [teachingWay, setTeachingWay] = useState(5);

    // section 5: write feedback
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [done, setDone] = useState(false);

    const selectedTeacher = useMemo(
        () => teachers.find((t) => String(t.id) === String(teacherId)),
        [teacherId, teachers],
    );

    // ✅ load meta
    useEffect(() => {
        if (!cid) return;

        let alive = true;

        (async () => {
            try {
                setPageLoading(true);

                const res = await apiUtils.get(`/feedback/public/${cid}`);
                const meta = res?.data?.metadata || {};

                if (!alive) return;

                setClassName(meta.className || "");
                setTeachers(Array.isArray(meta.teachers) ? meta.teachers : []);

                const first = (meta.teachers || [])[0]?.id;
                setTeacherId(first ? String(first) : "");
            } catch (e) {
                alert(
                    e?.response?.data?.message || "Cannot load feedback page",
                );
            } finally {
                if (alive) setPageLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [cid]);

    const submit = async () => {
        const text = message.trim();
        const sname = studentName.trim();

        if (!cid) return alert("Missing classId");
        if (!teacherId) return alert("Please choose a teacher");
        if (!text) return alert("Please write your feedback");

        try {
            setLoading(true);

            const payload = {
                classId: cid,
                className,
                studentName: sname,
                teacherId,
                teacherName: selectedTeacher?.name || "",
                rating,
                understand,
                teachingWay,
                message: text,
            };

            // ✅ REAL API
            await apiUtils.post(`/feedback/public/${cid}`, payload);

            setDone(true);
            setMessage("");
        } catch (e) {
            alert(e?.response?.data?.message || "Submit failed");
        } finally {
            setLoading(false);
        }
    };

    const Stars = ({ value, onChange, labelPrefix }) => (
        <div className="fbp-stars" role="radiogroup" aria-label={labelPrefix}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    className={`fbp-star ${value >= n ? "on" : ""}`}
                    onClick={() => onChange(n)}
                    aria-label={`${labelPrefix} ${n}`}
                >
                    ★
                </button>
            ))}
        </div>
    );

    if (pageLoading) {
        return (
            <div className="fbp-wrap">
                <div className="fbp-card">
                    <h1 className="fbp-h1">Feedback</h1>
                    <div style={{ color: "#6b7280", fontWeight: 700 }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fbp-wrap">
            <div className="fbp-card">
                {/* h1 class feedback */}
                <h1 className="fbp-h1">Feedback</h1>

                {/* h3 class name */}
                <h3 className="fbp-h3">{className || "—"}</h3>

                {/* student name */}
                <div className="fbp-meta">
                    <div className="fbp-meta-item">
                        <span className="fbp-meta-label">Student:</span>
                        <input
                            className="fbp-input"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Your name (optional)"
                        />
                    </div>

                    <div className="fbp-meta-item">
                        <span className="fbp-meta-label">Class ID:</span>
                        <span className="fbp-meta-value">{cid || "—"}</span>
                    </div>
                </div>

                {done && (
                    <div className="fbp-success">
                        ✅ Thank you! Your feedback has been submitted.
                    </div>
                )}

                {/* section 1: rate */}
                <section className="fbp-section">
                    <div className="fbp-section-title">
                        1) Rate (1 → 5 stars)
                    </div>
                    <Stars
                        value={rating}
                        onChange={setRating}
                        labelPrefix="Rate"
                    />
                </section>

                {/* section 2: choose teacher */}
                <section className="fbp-section">
                    <div className="fbp-section-title">2) Choose teacher</div>
                    <div className="fbp-teachers">
                        {teachers.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`fbp-pill ${String(teacherId) === String(t.id) ? "active" : ""}`}
                                onClick={() => setTeacherId(String(t.id))}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>

                    <div className="fbp-hint">
                        Selected: <b>{selectedTeacher?.name || "—"}</b>
                    </div>
                </section>

                {/* section 3: understand */}
                <section className="fbp-section">
                    <div className="fbp-section-title">3) Understand</div>
                    <Stars
                        value={understand}
                        onChange={setUnderstand}
                        labelPrefix="Understand"
                    />
                </section>

                {/* section 4: teaching way */}
                <section className="fbp-section">
                    <div className="fbp-section-title">4) Teaching way</div>
                    <Stars
                        value={teachingWay}
                        onChange={setTeachingWay}
                        labelPrefix="Teaching way"
                    />
                </section>

                {/* section 5: write feedback */}
                <section className="fbp-section">
                    <div className="fbp-section-title">5) Write feedback</div>
                    <textarea
                        className="fbp-textarea"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your feedback here..."
                    />
                </section>

                <div className="fbp-actions">
                    <button
                        type="button"
                        className="fbp-btn"
                        onClick={submit}
                        disabled={loading || !message.trim() || !teacherId}
                    >
                        {loading ? "Sending..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
