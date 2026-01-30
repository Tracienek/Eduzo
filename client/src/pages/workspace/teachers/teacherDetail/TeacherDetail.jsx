// src/pages/workspace/teachers/teacherDetail/TeacherDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUtils } from "../../../../utils/newRequest";
import teacherFallback from "../../../../assets/images/teacher.svg";
import "./TeacherDetail.css";

/** ---------- helpers ---------- */
const unwrap = (res) => {
    const root = res?.data ?? res;
    return root?.metadata ?? root?.data ?? root;
};

const safeText = (v) => (v == null || v === "" ? "—" : String(v));

const fmtDOB = (value) => {
    if (!value) return "—";
    const s = String(value).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        const [, yyyy, mm, dd] = m;
        return `${dd}/${mm}/${yyyy}`;
    }
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
};

const normalizeGender = (g) => {
    const x = String(g || "")
        .toLowerCase()
        .trim();
    if (!x) return "—";
    if (["male", "m", "nam"].includes(x)) return "Male";
    if (["female", "f", "nu", "nữ"].includes(x)) return "Female";
    return g;
};

const getServerOrigin = () => {
    const isProd = import.meta.env.VITE_ENV === "production";
    return isProd
        ? import.meta.env.VITE_SERVER_ORIGIN
        : import.meta.env.VITE_SERVER_LOCAL_ORIGIN;
};

const resolveAvatar = (url) => {
    if (!url) return "";
    const s = String(url);
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/uploads/")) return `${getServerOrigin()}${s}`;
    return s;
};

export default function TeacherDetail() {
    const { teacherId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [teacher, setTeacher] = useState(null);

    const [classesLoading, setClassesLoading] = useState(false);
    const [taughtClasses, setTaughtClasses] = useState([]);
    const [classesError, setClassesError] = useState("");

    const feedbackPlaceholder = useMemo(() => {
        return [
            "• (Coming soon) Student feedback will appear here.",
            "• You can later show average rating, recent comments, and sentiment.",
        ].join("\n");
    }, []);

    useEffect(() => {
        if (!teacherId) return;
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setPageError("");

                const res = await apiUtils.get("/center/teachers");
                const data = unwrap(res);
                const list = data?.teachers ?? data ?? [];
                const teachers = Array.isArray(list) ? list : [];

                const found = teachers.find(
                    (t) => String(t?._id) === String(teacherId),
                );

                if (!alive) return;
                setTeacher(found || null);
            } catch (err) {
                if (!alive) return;
                setPageError(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Failed to load teacher",
                );
                setTeacher(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [teacherId]);

    useEffect(() => {
        setClassesLoading(false);
        setTaughtClasses([]);
        setClassesError("");
    }, [teacherId]);

    if (loading) return <div className="td-muted">Loading...</div>;
    if (pageError) return <div className="td-error">{pageError}</div>;
    if (!teacher) return <div className="td-muted">Teacher not found</div>;

    const avatarUrl =
        resolveAvatar(teacher?.avatar || teacher?.photoUrl) || teacherFallback;

    const teacherName = safeText(teacher?.fullName || teacher?.name);

    return (
        <div className="td-wrap">
            <div className="td-topbar">
                <button
                    className="td-back"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>

                <div className="td-title" title={teacherName}>
                    {teacherName}
                </div>
            </div>

            <div className="td-grid">
                <section className="td-card td-profile">
                    <div className="td-avatar">
                        <img
                            src={avatarUrl}
                            alt="teacher avatar"
                            onError={(e) => {
                                e.currentTarget.src = teacherFallback;
                            }}
                            draggable={false}
                        />
                    </div>

                    <div className="td-name">{teacherName}</div>

                    <div className="td-meta">
                        <div className="td-row">
                            <span className="td-label">Email</span>
                            <span className="td-value">
                                {safeText(teacher?.email)}
                            </span>
                        </div>

                        <div className="td-row">
                            <span className="td-label">DOB</span>
                            <span className="td-value">
                                {fmtDOB(teacher?.dob || teacher?.dateOfBirth)}
                            </span>
                        </div>

                        <div className="td-row">
                            <span className="td-label">Gender</span>
                            <span className="td-value">
                                {normalizeGender(teacher?.gender)}
                            </span>
                        </div>

                        <div className="td-row">
                            <span className="td-label">Language</span>
                            <span className="td-value">
                                {safeText(teacher?.languageOrSpeciality)}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="td-card">
                    <div className="td-card-head">
                        <h3>Student Feedback</h3>
                        <span className="td-chip td-chip--soon">
                            Coming soon
                        </span>
                    </div>

                    <pre className="td-placeholder">{feedbackPlaceholder}</pre>

                    <div className="td-note">
                        Tip: When you build feedback page, store feedback by
                        teacherId, then show latest comments + average rating
                        here.
                    </div>
                </section>

                <section className="td-card td-classes">
                    <div className="td-card-head">
                        <h3>Classes Taught</h3>
                        <span className="td-chip">
                            {classesLoading
                                ? "Loading..."
                                : `${taughtClasses.length} classes`}
                        </span>
                    </div>

                    {classesError && (
                        <div className="td-error-inline">{classesError}</div>
                    )}

                    {!classesLoading &&
                        !classesError &&
                        taughtClasses.length === 0 && (
                            <div className="td-muted">
                                Classes taught is not available yet (classes
                                endpoint not configured).
                            </div>
                        )}

                    <div className="td-footnote">
                        * Classes taught will be enabled after backend provides
                        classes/attendance endpoints.
                    </div>
                </section>
            </div>
        </div>
    );
}
