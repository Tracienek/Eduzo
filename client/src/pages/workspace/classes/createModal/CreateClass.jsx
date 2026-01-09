// src/pages/workspace/classes/createModal
import { useEffect, useMemo, useState } from "react";
import { apiUtils } from "../../../../utils/newRequest";
import "./CreateModal.css";

const DEFAULT_FORM = {
    name: "",
    subject: "",
    scheduleText: "Mon, Wed, Fri - 9:00 AM",
};

const unwrap = (res) => {
    const root = res?.data ?? res;
    const data = root?.metadata ?? root?.data ?? root ?? null;
    return data?.class ?? data?.newClass ?? data;
};

export default function CreateClass({ open, onClose, onCreated }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = useMemo(
        () => form.name.trim() && form.subject.trim(),
        [form.name, form.subject]
    );

    // reset form + error mỗi lần mở modal
    useEffect(() => {
        if (open) {
            setForm(DEFAULT_FORM);
            setError("");
            setSubmitting(false);
        }
    }, [open]);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const update = (key) => (e) => {
        setError("");
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const closeOnBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        try {
            setSubmitting(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                subject: form.subject.trim(),
                scheduleText: form.scheduleText?.trim() || "",
            };

            const res = await apiUtils.post("/classes", payload);
            const created = unwrap(res);

            onCreated?.(created);
            onClose?.();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Create class failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="cm-backdrop"
            role="dialog"
            aria-modal="true"
            onMouseDown={closeOnBackdrop}
        >
            <div className="cm-modal" onMouseDown={(e) => e.stopPropagation()}>
                <button
                    className="cm-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <h3 className="cm-title">Create class</h3>

                <form className="cm-form" onSubmit={handleSubmit}>
                    <label className="cm-label">
                        <span>Class Name</span>
                        <input
                            className="cm-input"
                            placeholder="e.g: IELTS 1"
                            value={form.name}
                            onChange={update("name")}
                            autoFocus
                        />
                    </label>

                    <label className="cm-label">
                        <span>Subject</span>
                        <input
                            className="cm-input"
                            placeholder="e.g: English"
                            value={form.subject}
                            onChange={update("subject")}
                        />
                    </label>

                    <label className="cm-label">
                        <span>Schedule</span>
                        <div className="cm-input cm-input-with-icon">
                            <span className="cm-icon" aria-hidden="true">
                                📅
                            </span>
                            <input
                                className="cm-input-inner"
                                value={form.scheduleText}
                                onChange={update("scheduleText")}
                                placeholder="Mon, Wed, Fri - 9:00 AM"
                            />
                        </div>
                    </label>

                    {error && <div className="cm-error">{error}</div>}

                    <div className="cm-divider" />

                    <button
                        className="cm-primary"
                        type="submit"
                        disabled={!canSubmit || submitting}
                    >
                        {submitting ? "Creating..." : "Create"}
                    </button>
                </form>
            </div>
        </div>
    );
}
