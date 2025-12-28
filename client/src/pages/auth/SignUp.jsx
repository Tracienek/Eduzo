import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function SignUp() {
    const nav = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();

        // TODO: call API register teacher
        // demo: chuyển sang verification
        nav("/auth/vertification");
    };

    return (
        <>
            <h2 className="auth-title">Sign Up</h2>
            <p className="auth-subtitle">Create your teacher account</p>

            <form className="auth-form" onSubmit={onSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button className="auth-btn" type="submit">
                    Create Account
                </button>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link className="auth-link" to="/auth/sign-in">
                        Sign in
                    </Link>
                </div>
            </form>
        </>
    );
}
