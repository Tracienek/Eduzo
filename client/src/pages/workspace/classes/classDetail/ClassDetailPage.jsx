// src/pages/workspace/classes/classDetail/ClassDetailPage.jsx
import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUtils } from "../../../../utils/newRequest";
import "./ClassDetailPage.css";
import CreateStudent from "../createModal/CreateStudent";
import { useAuth } from "../../../../context/auth/AuthContext";

/** ---------- helpers ---------- **/
const pad2 = (n) => String(n).padStart(2, "0");
const fmtDMY = (d) =>
    `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

const WEEKDAY_MAP = {
    mon: 1,
    monday: 1,
    tue: 2,
    tues: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thur: 4,
    thurs: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
    sun: 0,
    sunday: 0,
};

function parseWeekdays(scheduleText = "") {
    const left = scheduleText.split("-")[0] || "";
    const tokens = left
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

    const days = tokens
        .map((t) => WEEKDAY_MAP[t])
        .filter((x) => typeof x === "number");

    return days.length ? Array.from(new Set(days)) : [1, 3, 5];
}

function getNextSessionDatesFromDate({ startDateISO, weekdays, count = 3 }) {
    const [y, m, d] = startDateISO.split("-").map(Number);
    const cur = new Date(y, m - 1, d);

    const results = [];
    while (results.length < count) {
        if (weekdays.includes(cur.getDay())) results.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return results;
}

const isoToDMY = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
};

const dmyToISO = (dmy) => {
    const m = dmy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
};

const normalizeDMYTyping = (v) => {
    let s = v.replace(/[^\d/]/g, "").slice(0, 10);
    s = s.replace(/^(\d{2})(\d)/, "$1/$2");
    s = s.replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
    return s;
};

const DAY_NAME = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const TUITION_KEY = "__TUITION__";

const extractTimeFromSchedule = (scheduleText = "") => {
    const parts = scheduleText.split("-").map((s) => s.trim());
    return parts.length >= 2 ? parts.slice(1).join("-").trim() : "";
};

const toLocalISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const role = userInfo?.role; // "teacher" | "center" | "student"
    const canUseNotes = role === "teacher" || role === "center";

    const [openStudent, setOpenStudent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cls, setCls] = useState(null);

    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
            now.getDate()
        )}`;
    });

    const [displayDate, setDisplayDate] = useState(() => isoToDMY(startDate));

    const [checkState, setCheckState] = useState({});
    const [isEditingAttendance, setIsEditingAttendance] = useState(false);
    const snapshotRef = useRef(null);

    const [pendingAttendance, setPendingAttendance] = useState({});
    const [pendingHomework, setPendingHomework] = useState({});
    const [pendingTuition, setPendingTuition] = useState({});

    /** ========= NOTES ========= */
    const [notes, setNotes] = useState([]);
    const [noteText, setNoteText] = useState("");
    const [noteLoading, setNoteLoading] = useState(false);

    const ensureStudentState = (studentId, base) => {
        if (base[studentId]) return base;
        return {
            ...base,
            [studentId]: { attendance: {}, homework: {}, tuition: false },
        };
    };

    /** ===== load class ===== */
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const res = await apiUtils.get(`/classes/${classId}`);
                const data = res?.data?.metadata || res?.data || {};
                const klass = data.class || data;

                if (!alive) return;

                setCls(klass);

                const init = {};
                (klass.students || []).forEach((s, idx) => {
                    const id =
                        s._id ||
                        s.id ||
                        s.email ||
                        s.fullName ||
                        s.name ||
                        String(idx);
                    init[id] = {
                        attendance: {},
                        homework: {},
                        tuition: !!s.tuitionPaid || !!s.tuition,
                    };
                });
                setCheckState(init);
            } catch {
                if (alive) setCls(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [classId]);

    useEffect(() => {
        setDisplayDate(isoToDMY(startDate));
    }, [startDate]);

    const weekdays = useMemo(
        () => parseWeekdays(cls?.scheduleText || "Mon, Wed, Fri - 9:00 AM"),
        [cls?.scheduleText]
    );

    const sessionDates = useMemo(() => {
        return getNextSessionDatesFromDate({
            startDateISO: startDate,
            weekdays,
            count: 3,
        });
    }, [startDate, weekdays]);

    const dateKeys = useMemo(
        () => sessionDates.map(toLocalISODate),
        [sessionDates]
    );

    /** ===== fetch attendance records ===== */
    useEffect(() => {
        if (!classId) return;

        let alive = true;

        (async () => {
            try {
                const res = await apiUtils.get(
                    `/classes/${classId}/attendance?dates=${dateKeys.join(",")}`
                );
                const records = res?.data?.metadata?.records || [];
                if (!alive) return;

                setCheckState((prev) => {
                    const next = { ...prev };

                    for (const r of records) {
                        const sid = String(r.studentId);
                        if (!next[sid]) {
                            next[sid] = {
                                attendance: {},
                                homework: {},
                                tuition: false,
                            };
                        }

                        if (
                            r.dateKey === TUITION_KEY &&
                            typeof r.tuition === "boolean"
                        ) {
                            next[sid] = { ...next[sid], tuition: r.tuition };
                            continue;
                        }

                        if (typeof r.attendance === "boolean") {
                            next[sid] = {
                                ...next[sid],
                                attendance: {
                                    ...(next[sid].attendance || {}),
                                    [r.dateKey]: r.attendance,
                                },
                            };
                        }
                        if (typeof r.homework === "boolean") {
                            next[sid] = {
                                ...next[sid],
                                homework: {
                                    ...(next[sid].homework || {}),
                                    [r.dateKey]: r.homework,
                                },
                            };
                        }
                    }

                    return next;
                });
            } catch {
                // ignore
            }
        })();

        return () => {
            alive = false;
        };
    }, [classId, dateKeys]);

    const toggleLocal = (studentId, type, dateKey, value) => {
        setCheckState((prev) => {
            let next = { ...prev };
            next = ensureStudentState(studentId, next);
            const cur = next[studentId];

            if (type === "tuition") {
                next[studentId] = { ...cur, tuition: value };
                return next;
            }

            next[studentId] = {
                ...cur,
                [type]: {
                    ...(cur[type] || {}),
                    [dateKey]: value,
                },
            };
            return next;
        });
    };

    const onlinePingedRef = useRef(false);

    const enterAttendanceEditMode = () => {
        if (isEditingAttendance) return;
        if (!onlinePingedRef.current && classId) {
            onlinePingedRef.current = true;
            apiUtils.post(`/classes/${classId}/online/ping`).catch(() => {});
        }
        snapshotRef.current = JSON.parse(JSON.stringify(checkState));
        setPendingAttendance({});
        setPendingHomework({});
        setPendingTuition({});
        setIsEditingAttendance(true);
    };

    const exitAttendanceEditMode = () => {
        setIsEditingAttendance(false);
        setPendingAttendance({});
        setPendingHomework({});
        setPendingTuition({});
        snapshotRef.current = null;
        onlinePingedRef.current = false;
    };

    const markAttendancePending = (studentId, dateKey, value) => {
        setPendingAttendance((prev) => {
            const cur = prev[studentId] || {};
            return {
                ...prev,
                [studentId]: { ...cur, [dateKey]: value },
            };
        });
    };

    const markHomeworkPending = (studentId, dateKey, value) => {
        setPendingHomework((prev) => {
            const cur = prev[studentId] || {};
            return { ...prev, [studentId]: { ...cur, [dateKey]: value } };
        });
    };

    const markTuitionPending = (studentId, value) => {
        setPendingTuition((prev) => ({ ...prev, [studentId]: value }));
    };

    const saveAttendance = async () => {
        const changes = [];

        Object.entries(pendingAttendance).forEach(([studentId, m]) => {
            Object.entries(m || {}).forEach(([dateKey, value]) => {
                changes.push({ studentId, dateKey, attendance: !!value });
            });
        });

        Object.entries(pendingHomework).forEach(([studentId, m]) => {
            Object.entries(m || {}).forEach(([dateKey, value]) => {
                changes.push({ studentId, dateKey, homework: !!value });
            });
        });

        const tuitionChanges = Object.entries(pendingTuition).map(
            ([studentId, tuition]) => ({ studentId, tuition: !!tuition })
        );

        if (!changes.length && !tuitionChanges.length) {
            exitAttendanceEditMode();
            return;
        }

        try {
            await apiUtils.patch(`/classes/${classId}/attendance/bulk`, {
                changes,
                tuitionChanges,
            });

            exitAttendanceEditMode();
        } catch (err) {
            console.error(err);
            alert(
                err?.response?.data?.message || "Save failed. Please try again."
            );
        }
    };

    const cancelAttendance = () => {
        const snap = snapshotRef.current;
        if (snap) setCheckState(snap);
        exitAttendanceEditMode();
    };

    /** ===== NOTES: fetch & submit (teacher <-> center only) ===== */
    useEffect(() => {
        if (!classId) return;
        if (!canUseNotes) return;

        let alive = true;

        (async () => {
            try {
                const res = await apiUtils.get(`/classes/${classId}/notes`);
                const list =
                    res?.data?.metadata?.notes ||
                    res?.data?.notes ||
                    res?.data?.metadata ||
                    [];
                if (!alive) return;
                setNotes(Array.isArray(list) ? list : []);
            } catch {
                if (alive) setNotes([]);
            }
        })();

        return () => {
            alive = false;
        };
    }, [classId, canUseNotes]);

    const submitNote = async () => {
        if (!canUseNotes) return;

        const content = noteText.trim();
        if (!content) {
            alert("content is required");
            return;
        }

        const toRole = role === "teacher" ? "center" : "teacher";

        try {
            setNoteLoading(true);

            const res = await apiUtils.post(`/classes/${classId}/notes`, {
                content, // ✅ MUST be `content`
                toRole, // ✅ teacher -> center | center -> teacher
            });

            const created =
                res?.data?.metadata?.note || res?.data?.note || null;

            // optimistic prepend (fallback if BE returns nothing)
            const fallback = {
                _id: `tmp-${Date.now()}`,
                content,
                fromRole: role,
                toRole,
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

    if (loading) return <div className="cd-muted">Loading...</div>;
    if (!cls) return <div className="cd-muted">Class not found</div>;

    const nextSession = sessionDates?.[0] || null;
    const nextSessionDayLabel = nextSession
        ? DAY_NAME[nextSession.getDay()]
        : "";
    const nextSessionTimeLabel = extractTimeFromSchedule(
        cls?.scheduleText || ""
    );
    const nextSessionSubLabel = nextSession
        ? `${fmtDMY(nextSession)}${
              nextSessionTimeLabel ? `, ${nextSessionTimeLabel}` : ""
          }`
        : "—";

    return (
        <div className="cd-wrap">
            <div className="cd-top">
                <div className="cd-title">
                    {cls.name || cls.className || "{classes.name}"}
                </div>
                <div className="cd-schedule">
                    {cls.scheduleText || "Mon, Wed, Fri - 9:00 AM"}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        className="cd-btn"
                        type="button"
                        onClick={() =>
                            navigate(`/workspace/classes/${classId}/attendance`)
                        }
                        title="View full attendance"
                    >
                        View full attendance
                    </button>

                    <button
                        className="cd-btn"
                        type="button"
                        onClick={() => setOpenStudent(true)}
                    >
                        + Student
                    </button>
                </div>
            </div>

            <CreateStudent
                open={openStudent}
                onClose={() => setOpenStudent(false)}
                classId={classId}
                onCreated={(createdStudent) => {
                    if (!createdStudent) return;

                    setCls((prev) => {
                        if (!prev) return prev;
                        const nextStudents = [
                            ...(prev.students || []),
                            createdStudent,
                        ];
                        return {
                            ...prev,
                            students: nextStudents,
                            totalStudents:
                                prev.totalStudents ??
                                prev.studentCount ??
                                nextStudents.length,
                            studentCount:
                                prev.studentCount ??
                                prev.totalStudents ??
                                nextStudents.length,
                        };
                    });

                    const id =
                        createdStudent._id ||
                        createdStudent.id ||
                        createdStudent.email ||
                        createdStudent.fullName ||
                        createdStudent.name ||
                        String(Date.now());

                    setCheckState((prev) => ({
                        ...prev,
                        [id]: {
                            attendance: {},
                            homework: {},
                            tuition:
                                !!createdStudent.tuitionPaid ||
                                !!createdStudent.tuition,
                        },
                    }));
                }}
            />

            <div className="cd-stats">
                <div className="cd-stat">
                    <div className="cd-stat-label">Total Students</div>
                    <div className="cd-stat-value">
                        {cls.totalStudents ?? cls.studentCount ?? 0}
                    </div>
                    <div className="cd-stat-sub">Enrolled</div>
                </div>

                <div className="cd-stat">
                    <div className="cd-stat-label">Next Session</div>
                    <div className="cd-stat-value">
                        {nextSession ? nextSessionDayLabel : "—"}
                    </div>
                    <div className="cd-stat-sub">{nextSessionSubLabel}</div>
                </div>

                <div className="cd-stat">
                    <div className="cd-stat-label">Duration</div>
                    <div className="cd-stat-value">
                        {cls?.durationMinutes ?? 90} min
                    </div>
                    <div className="cd-stat-sub">Per session</div>
                </div>
            </div>

            <div className="cd-section">
                <div className="cd-section-head">
                    <h2>Students</h2>

                    <div className="cd-controls">
                        <div className="cd-date">
                            <span className="cd-date-label">Date</span>

                            <div className="cd-date-input">
                                <input
                                    className="cd-date-text"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="dd/mm/yyyy"
                                    value={displayDate}
                                    onChange={(e) => {
                                        const v = normalizeDMYTyping(
                                            e.target.value
                                        );
                                        setDisplayDate(v);

                                        const iso = dmyToISO(v);
                                        if (iso) setStartDate(iso);
                                    }}
                                    onBlur={() => {
                                        const iso = dmyToISO(displayDate);
                                        if (!iso)
                                            setDisplayDate(isoToDMY(startDate));
                                    }}
                                />

                                <input
                                    id="datePicker"
                                    className="cd-real-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />

                                <button
                                    type="button"
                                    className="cd-date-icon-btn"
                                    onClick={() => {
                                        const el =
                                            document.getElementById(
                                                "datePicker"
                                            );
                                        if (!el) return;
                                        if (el.showPicker) el.showPicker();
                                        else el.focus();
                                    }}
                                    aria-label="Open date picker"
                                >
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M8 2v3M16 2v3M3.5 9h17M6 6h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 22H6a2.5 2.5 0 0 1-2.5-2.5v-11A2.5 2.5 0 0 1 6 6Z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M7.5 12.5h3v3h-3v-3Z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cd-table-wrap">
                    <table className="cd-table cd-table-att">
                        <thead>
                            <tr>
                                <th className="cd-col-no">No</th>
                                <th className="cd-col-name">Name</th>

                                {sessionDates.map((d, i) => (
                                    <Fragment key={`pair-head-${i}`}>
                                        <th className="cd-col-date">
                                            {fmtDMY(d)}
                                        </th>
                                        <th className="cd-col-hw">Homework</th>
                                    </Fragment>
                                ))}

                                <th className="cd-col-tuition">Tuition fee</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(cls.students || []).map((s, idx) => {
                                const studentId =
                                    s._id ||
                                    s.id ||
                                    s.email ||
                                    s.fullName ||
                                    s.name ||
                                    String(idx);

                                return (
                                    <tr key={studentId}>
                                        <td>{idx + 1}</td>
                                        <td>{s.fullName || s.name}</td>

                                        {dateKeys.map((dk, i) => (
                                            <Fragment
                                                key={`pair-row-${studentId}-${i}`}
                                            >
                                                <td className="cd-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !!checkState?.[
                                                                studentId
                                                            ]?.attendance?.[dk]
                                                        }
                                                        onChange={(e) => {
                                                            enterAttendanceEditMode();
                                                            const val =
                                                                e.target
                                                                    .checked;

                                                            toggleLocal(
                                                                studentId,
                                                                "attendance",
                                                                dk,
                                                                val
                                                            );

                                                            markAttendancePending(
                                                                studentId,
                                                                dk,
                                                                val
                                                            );
                                                        }}
                                                    />
                                                </td>

                                                <td className="cd-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !!checkState?.[
                                                                studentId
                                                            ]?.homework?.[dk]
                                                        }
                                                        onChange={(e) => {
                                                            enterAttendanceEditMode();
                                                            const val =
                                                                e.target
                                                                    .checked;

                                                            toggleLocal(
                                                                studentId,
                                                                "homework",
                                                                dk,
                                                                val
                                                            );
                                                            markHomeworkPending(
                                                                studentId,
                                                                dk,
                                                                val
                                                            );
                                                        }}
                                                    />
                                                </td>
                                            </Fragment>
                                        ))}

                                        <td className="cd-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    !!checkState?.[studentId]
                                                        ?.tuition
                                                }
                                                onChange={(e) => {
                                                    enterAttendanceEditMode();
                                                    const val =
                                                        e.target.checked;

                                                    toggleLocal(
                                                        studentId,
                                                        "tuition",
                                                        null,
                                                        val
                                                    );
                                                    markTuitionPending(
                                                        studentId,
                                                        val
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}

                            {(cls.students || []).length === 0 && (
                                <tr>
                                    <td
                                        colSpan={
                                            2 + sessionDates.length * 2 + 1
                                        }
                                        className="cd-empty"
                                    >
                                        No students
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isEditingAttendance && (
                    <div
                        className="cd-actions"
                        style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                        }}
                    >
                        <button
                            type="button"
                            className="cd-btn-cancel"
                            onClick={cancelAttendance}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="cd-btn-save"
                            onClick={saveAttendance}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* ===== NOTES (Teacher <-> Center only) ===== */}
            {canUseNotes && (
                <div className="cd-section">
                    <div className="cd-section-head">
                        <h2>
                            Notes{" "}
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: "rgba(0,0,0,.55)",
                                }}
                            >
                                (
                                {role === "teacher"
                                    ? "Teacher → Center"
                                    : "Center → Teacher"}
                                )
                            </span>
                        </h2>
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
                                    : "Write a note for Teacher (shows in Teacher notifications)..."
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
                        </div>
                    </div>

                    <div className="cd-note-list">
                        {notes.length === 0 && (
                            <div className="cd-empty" style={{ marginTop: 10 }}>
                                No notes yet
                            </div>
                        )}

                        {notes.map((n) => (
                            <div className="cd-note-item" key={n._id}>
                                <div className="cd-note-meta">
                                    <span className="cd-note-role">
                                        {n.fromRole} → {n.toRole}
                                    </span>
                                    <span className="cd-note-time">
                                        {n?.createdAt
                                            ? new Date(
                                                  n.createdAt
                                              ).toLocaleString()
                                            : ""}
                                    </span>
                                </div>

                                {/* ✅ IMPORTANT: use n.content */}
                                <div className="cd-note-msg">
                                    {n.content || ""}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
