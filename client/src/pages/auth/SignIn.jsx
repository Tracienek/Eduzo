import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

export default function SignIn() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        nav("/auth/verification");
    };

    return (
        <>
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Great to see you again</p>

            <form className="auth-form" onSubmit={onSubmit}>
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
                    <div className="auth-input-wrap">
                        <input
                            className="auth-input"
                            type={show ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="auth-eye"
                            onClick={() => setShow(!show)}
                        >
                            {show ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <div className="auth-row">
                    <span />
                    <a className="auth-link" href="#">
                        Forgot your password?
                    </a>
                </div>

                <button className="auth-btn" type="submit">
                    Sign In
                </button>

                <div className="auth-footer">
                    <span>Are you new here? </span>
                    <Link className="auth-link" to="/auth/signup">
                        Create a free account
                    </Link>
                </div>
            </form>
        </>
    );
}
