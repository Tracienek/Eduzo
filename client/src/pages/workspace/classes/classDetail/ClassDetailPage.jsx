import { useEffect, useMemo, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import { apiUtils } from "../../../../utils/newRequest";
import "./ClassDetailPage.css";

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

// Lấy N buổi học từ một ngày bắt đầu (filter theo ngày)
function getNextSessionDatesFromDate({ startDateISO, weekdays, count = 3 }) {
    // startDateISO: "YYYY-MM-DD"
    const [y, m, d] = startDateISO.split("-").map(Number);
    const start = new Date(y, m - 1, d);

    const results = [];
    for (
        let cur = new Date(start);
        results.length < count;
        cur.setDate(cur.getDate() + 1)
    ) {
        if (weekdays.includes(cur.getDay())) results.push(new Date(cur));
    }
    return results;
}

/** convert helpers */
const isoToDMY = (iso) => {
    // iso: YYYY-MM-DD
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
};

const dmyToISO = (dmy) => {
    // dmy: DD/MM/YYYY
    const m = dmy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
};

const normalizeDMYTyping = (v) => {
    // only digits and /
    let s = v.replace(/[^\d/]/g, "").slice(0, 10);
    // auto add slash after dd and mm
    s = s.replace(/^(\d{2})(\d)/, "$1/$2");
    s = s.replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
    return s;
};

// // helpers (đặt gần các helper khác)
// const DAY_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// const extractTimeFromSchedule = (scheduleText = "") => {
//   // Ví dụ: "Mon, Wed, Fri - 9:00 AM" -> "9:00 AM"
//   const parts = scheduleText.split("-").map(s => s.trim());
//   return parts.length >= 2 ? parts.slice(1).join("-").trim() : "";
// };

// ...

// // trong component, trước return
// const nextSession = sessionDates?.[0] || null;
// const nextSessionDayLabel = nextSession ? DAY_NAME[nextSession.getDay()] : "";
// const nextSessionTimeLabel = extractTimeFromSchedule(cls?.scheduleText || "");
// const nextSessionSubLabel = nextSession
//   ? `${fmtDMY(nextSession)}${nextSessionTimeLabel ? `, ${nextSessionTimeLabel}` : ""}`
//   : "—";

export default function ClassDetailPage() {
    const { classId } = useParams();
    const [loading, setLoading] = useState(true);
    const [cls, setCls] = useState(null);

    // filter theo ngày (mặc định: hôm nay)
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
            now.getDate()
        )}`;
    });

    // UI hiển thị DD/MM/YYYY
    const [displayDate, setDisplayDate] = useState(() =>
        isoToDMY(
            `${new Date().getFullYear()}-${pad2(
                new Date().getMonth() + 1
            )}-${pad2(new Date().getDate())}`
        )
    );

    // local state tick checkbox
    const [checkState, setCheckState] = useState({});

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

    // nếu startDate thay đổi (từ picker), đồng bộ displayDate
    useEffect(() => {
        setDisplayDate(isoToDMY(startDate));
    }, [startDate]);

    const weekdays = useMemo(
        () => parseWeekdays(cls?.scheduleText || "Mon, Wed, Fri - 9:00 AM"),
        [cls?.scheduleText]
    );

    // 3 buổi học kế tiếp từ ngày filter
    const sessionDates = useMemo(() => {
        return getNextSessionDatesFromDate({
            startDateISO: startDate,
            weekdays,
            count: 3,
        });
    }, [startDate, weekdays]);

    // key YYYY-MM-DD để lưu checkbox
    const dateKeys = useMemo(
        () => sessionDates.map((d) => d.toISOString().slice(0, 10)),
        [sessionDates]
    );

    const toggle = (studentId, type, dateKey, value) => {
        setCheckState((prev) => {
            const cur = prev[studentId] || {
                attendance: {},
                homework: {},
                tuition: false,
            };
            const next = { ...prev };

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

    if (loading) return <div className="cd-muted">Loading...</div>;
    if (!cls) return <div className="cd-muted">Class not found</div>;

    return (
        <div className="cd-wrap">
            <div className="cd-top">
                <div className="cd-title">
                    {cls.name || cls.className || "{classes.name}"}
                </div>
                <div className="cd-schedule">
                    {cls.scheduleText || "Mon, Wed, Fri - 9:00 AM"}
                </div>

                <button className="cd-btn" type="button">
                    + Student
                </button>
            </div>

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
                        {cls.nextSessionDay || "Monday"}
                    </div>
                    <div className="cd-stat-sub">
                        {cls.nextSessionTime || "Dec 30, 9:00 AM"}
                    </div>
                </div>

                {/* <div className="cd-stat">
                    <div className="cd-stat-label">Next Session</div>
                    <div className="cd-stat-value">
                        {nextSession ? nextSessionDayLabel : "—"}
                    </div>
                    <div className="cd-stat-sub">{nextSessionSubLabel}</div>
                </div> */}
            </div>

            <div className="cd-section">
                <div className="cd-section-head">
                    <h3>Students</h3>

                    <div className="cd-controls">
                        <div className="cd-date">
                            <span className="cd-date-label">Date</span>

                            <div className="cd-date-input">
                                {/* TEXT hiển thị DD/MM/YYYY */}
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
                                        // nếu nhập sai -> revert về startDate hiện tại
                                        const iso = dmyToISO(displayDate);
                                        if (!iso)
                                            setDisplayDate(isoToDMY(startDate));
                                    }}
                                />

                                {/* DATE thật để mở calendar + giữ value ISO */}
                                <input
                                    id="datePicker"
                                    className="cd-real-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />

                                {/* icon mở picker */}
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

                                {/* xen kẽ: Date | Homework */}
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
                                                {/* Attendance */}
                                                <td className="cd-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !!checkState?.[
                                                                studentId
                                                            ]?.attendance?.[dk]
                                                        }
                                                        onChange={(e) =>
                                                            toggle(
                                                                studentId,
                                                                "attendance",
                                                                dk,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                </td>

                                                {/* Homework */}
                                                <td className="cd-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !!checkState?.[
                                                                studentId
                                                            ]?.homework?.[dk]
                                                        }
                                                        onChange={(e) =>
                                                            toggle(
                                                                studentId,
                                                                "homework",
                                                                dk,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </Fragment>
                                        ))}

                                        {/* Tuition */}
                                        <td className="cd-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    !!checkState?.[studentId]
                                                        ?.tuition
                                                }
                                                onChange={(e) =>
                                                    toggle(
                                                        studentId,
                                                        "tuition",
                                                        null,
                                                        e.target.checked
                                                    )
                                                }
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
            </div>
        </div>
    );
}
