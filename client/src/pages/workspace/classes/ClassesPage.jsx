// pages/workspace/classes/ClassesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUtils } from "../../../utils/newRequest";
import "./ClassesPage.css";
import CreateClass from "./createModal/CreateClass";

function ClassCard({ c, onOpen }) {
    const isOnline = !!c?.isOnline;
    const duration = c?.sessionDurationMin ?? 90;

    return (
        <button className="class-card" type="button" onClick={onOpen}>
            <div
                className="class-card-title"
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                }}
            >
                <span
                    className={`dot ${isOnline ? "dot-green" : "dot-gray"}`}
                />
                {c?.name || c?.className || "Unnamed class"}
            </div>

            <div className="class-card-sub">{c?.subject || "—"}</div>

            <div className="class-card-meta">
                <div className="class-card-row">
                    <span className="label">Students</span>
                    <span className="pill">
                        {c?.totalStudents ?? c?.studentCount ?? "—"}
                    </span>
                </div>

                <div className="class-card-row">
                    <span className="label">Schedule</span>
                    <span className="value">
                        {c?.scheduleText || "Mon, Wed, Fri - 9:00 AM"}
                    </span>
                </div>

                <div className="class-card-row">
                    <span className="label">Duration</span>
                    <span className="value">{duration} min</span>
                </div>
            </div>

            <div className="class-card-footer">
                <span className="linkish">View Details</span>
            </div>
        </button>
    );
}

export default function ClassesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);

    const fetchClasses = async (setLoadingFlag = false) => {
        try {
            if (setLoadingFlag) setLoading(true);

            const res = await apiUtils.get("/classes/available");
            const data = res?.data?.metadata || res?.data || {};
            const list = Array.isArray(data.classes)
                ? data.classes
                : Array.isArray(data)
                ? data
                : [];

            setClasses(list);
        } catch {
            setClasses([]);
        } finally {
            if (setLoadingFlag) setLoading(false);
        }
    };

    useEffect(() => {
        let alive = true;

        (async () => {
            if (!alive) return;
            await fetchClasses(true);
        })();

        const t = setInterval(() => {
            if (!alive) return;
            fetchClasses(false);
        }, 20000);

        return () => {
            alive = false;
            clearInterval(t);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openClass = (c) => navigate(`/workspace/classes/${c._id}`);

    const onlineClasses = useMemo(
        () => classes.filter((c) => !!c?.isOnline),
        [classes]
    );
    const allClasses = classes;

    return (
        <div className="classes-page">
            {/* ===== Online Class Section ===== */}
            <div className="classes-page-header">
                <h2>Online Class</h2>
            </div>

            {loading && <div className="classes-muted">Loading...</div>}

            {!loading && onlineClasses.length === 0 && (
                <div className="classes-muted">
                    No class is active right now
                </div>
            )}

            {!loading && onlineClasses.length > 0 && (
                <div className="classes-grid">
                    {onlineClasses.map((c) => (
                        <ClassCard
                            key={c._id}
                            c={c}
                            onOpen={() => openClass(c)}
                        />
                    ))}
                </div>
            )}

            {/* ===== Your Classes Section ===== */}
            <div className="classes-page-header" style={{ marginTop: 18 }}>
                <h2>Your Classes</h2>
                <button
                    className="classes-primary-btn"
                    type="button"
                    onClick={() => setOpenCreate(true)}
                >
                    + Classes
                </button>
            </div>

            <CreateClass
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={(newClass) => {
                    if (!newClass?._id) return;
                    // push vào list luôn cho mượt UX
                    setClasses((prev) => [newClass, ...prev]);
                }}
            />

            {!loading && allClasses.length === 0 && (
                <div className="classes-muted">No available classes</div>
            )}

            {!loading && allClasses.length > 0 && (
                <div className="classes-grid">
                    {allClasses.map((c) => (
                        <ClassCard
                            key={c._id}
                            c={c}
                            onOpen={() => openClass(c)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
