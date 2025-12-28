import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import "./auth.css";

export default function Vertification() {
    const nav = useNavigate();
    const [code, setCode] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();

        // TODO: verify OTP/email code
        // demo: sau verify chuyển sang dashboard
        nav("/teacher/dashboard");
    };

    return (
        <>
            <h2 className="auth-title">Verification</h2>
            <p className="auth-subtitle">Enter the code sent to your email</p>

            <form className="auth-form" onSubmit={onSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Verification Code</label>
                    <input
                        className="auth-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>

                <button
                    className="auth-btn"
                    type="submit"
                    disabled={code.trim().length < 4}
                >
                    Verify
                </button>

                <div className="auth-footer">
                    <Link className="auth-link" to="/auth/sign-in">
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </>
    );
}
