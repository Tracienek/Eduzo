// TeacherPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import teacherImg from "../../../assets/images/teacher.svg";
import { apiUtils } from "../../../utils/newRequest";
import "./TeacherPage.css";

import CreateTeacherModal from "./createModal/CreateTeacherModal";

/** -------- helpers -------- */
const unwrap = (res) => {
    const root = res?.data ?? res;
    return root?.metadata ?? root?.data ?? root;
};

// ✅ robust id getter (fix click not navigate)
const getTeacherId = (t) =>
    t?._id ||
    t?.id ||
    t?.teacherId ||
    t?.userId ||
    t?.teacher?._id ||
    t?.teacher?.id ||
    t?.accountId ||
    null;

/** -------- card -------- */
function TeacherCard({ t, onClick }) {
    const navigate = useNavigate();
    const id = getTeacherId(t);

    const go = () => {
        onClick?.(t);

        if (!id) {
            console.warn(
                "Missing teacher id for navigation. Teacher object:",
                t,
            );
            return;
        }

        navigate(`/workspace/teachers/${id}`);
    };

    return (
        <div
            className="teacher-card"
            role="button"
            tabIndex={0}
            onClick={go}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go();
                }
            }}
            aria-label={`Open ${t?.fullName || t?.name || "teacher"}`}
        >
            <div className="teacher-avatar">
                <img src={teacherImg} alt="" draggable={false} />
            </div>
            <div className="teacher-name">{t?.fullName || t?.name || "—"}</div>
        </div>
    );
}

/** -------- page -------- */
export default function TeacherPage({ onOpenTeacher }) {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [openCreate, setOpenCreate] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setPageError("");

                const res = await apiUtils.get("/center/teachers");
                const data = unwrap(res);
                const list = data?.teachers ?? data ?? [];

                if (!mounted) return;
                setTeachers(Array.isArray(list) ? list : []);
            } catch (err) {
                if (!mounted) return;
                setPageError(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Failed to load teachers",
                );
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const onCreated = (teacher) => {
        if (!teacher) return;

        // ✅ avoid duplicates if same teacher already exists
        const newId = getTeacherId(teacher);
        setTeachers((prev) => {
            if (!newId) return [teacher, ...prev];
            const filtered = prev.filter((t) => getTeacherId(t) !== newId);
            return [teacher, ...filtered];
        });
    };

    const content = useMemo(() => {
        if (loading) return <p>Loading...</p>;
        if (pageError) return <p className="tp-error">{pageError}</p>;
        if (!teachers.length)
            return <p>No teachers yet. Click “＋ Teachers”</p>;
        return null;
    }, [loading, pageError, teachers.length]);

    return (
        <section className="teachers-panel">
            <div className="teachers-header">
                <h2>Your Teachers</h2>
                <button onClick={() => setOpenCreate(true)}>＋ Teachers</button>
            </div>

            {content}

            <div className="teachers-grid">
                {teachers.map((t, i) => {
                    const id = getTeacherId(t);
                    return (
                        <TeacherCard
                            key={
                                id ||
                                `${t?.email || t?.fullName || "teacher"}-${i}`
                            }
                            t={t}
                            onClick={(teacher) => onOpenTeacher?.(teacher)}
                        />
                    );
                })}
            </div>

            <CreateTeacherModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={onCreated}
            />
        </section>
    );
}
