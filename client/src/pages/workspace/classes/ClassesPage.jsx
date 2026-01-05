// pages/workspace/classes/ClassesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUtils } from "../../../utils/newRequest";
import "./ClassesPage.css";

export default function ClassesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const res = await apiUtils.get("/classes/available");
                // backend trả: { metadata: { classes: [...] } } hoặc { classes: [...] }
                const data = res?.data?.metadata || res?.data || {};
                const list = Array.isArray(data.classes)
                    ? data.classes
                    : Array.isArray(data)
                    ? data
                    : [];
                if (alive) setClasses(list);
            } catch {
                if (alive) setClasses([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const openClass = (c) => {
        if (c?.folderId) return navigate(`/workspace/classes/${c._id}`);
        navigate(`/workspace/classes/${c._id}`);
    };

    return (
        <div className="classes-page">
            <div className="classes-page-header">
                <h2>Your Classes</h2>
                <button className="classes-primary-btn" type="button">
                    + Classes
                </button>
            </div>

            {loading && <div className="classes-muted">Loading...</div>}

            {!loading && classes.length === 0 && (
                <div className="classes-muted">No available classes</div>
            )}

            {!loading && classes.length > 0 && (
                <div className="classes-grid">
                    {classes.map((c) => (
                        <button
                            key={c._id}
                            className="class-card"
                            type="button"
                            onClick={() => openClass(c)}
                        >
                            <div className="class-card-title">
                                {c.name || c.className || "Unnamed class"}
                            </div>
                            <div className="class-card-sub">
                                {c.subject || "—"}
                            </div>

                            <div className="class-card-meta">
                                <div className="class-card-row">
                                    <span className="label">Students</span>
                                    <span className="pill">
                                        {c.totalStudents ??
                                            c.studentCount ??
                                            "—"}
                                    </span>
                                </div>

                                <div className="class-card-row">
                                    <span className="label">Schedule</span>
                                    <span className="value">
                                        {c.scheduleText ||
                                            "Mon, Wed, Fri - 9:00 AM"}
                                    </span>
                                </div>
                            </div>

                            <div className="class-card-footer">
                                <span className="linkish">View Details</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
