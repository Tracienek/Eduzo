// src/pages/auth/SignIn.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import "./auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function SignIn() {
    const nav = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitLoginLoading, setIsSubmitLoginLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [inputs, setInputs] = useState({ email: "", password: "" });

    const onChange = (e) => {
        const { name, value } = e.target;
        setInputs((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "", serverError: "" }));
    };

    const validateInputs = () => {
        const errs = {};
        if (!inputs.email.trim()) errs.email = "Email is required";
        if (!inputs.password.trim()) errs.password = "Password is required";
        return errs;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitLoginLoading(true);

        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            setIsSubmitLoginLoading(false);
            return;
        }

        try {
            const email = inputs.email.trim().toLowerCase();
            const password = inputs.password;

            const result = await login(email, password);

            if (!result?.success) {
                setErrors({ serverError: "Invalid email or password" });
                return;
            }

            // Optional: force teacher to change password (if you want)
            // if (result.user?.mustChangePassword) {
            //     nav("/workspace/profile?forceChange=1");
            //     return;
            // }

            nav("/workspace");
        } catch (err) {
            setErrors({
                serverError:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Invalid email or password",
            });
        } finally {
            setIsSubmitLoginLoading(false);
        }
    };

    return (
        <>
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Great to see you again</p>

            <form className="auth-form" onSubmit={onSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <i className="fa-solid fa-envelope" />
                        </span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={inputs.email}
                            onChange={onChange}
                            className="auth-input"
                        />
                    </div>
                    <p className={`auth-error ${errors.email ? "show" : ""}`}>
                        {errors.email}
                    </p>
                </div>

                <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <i className="fa-solid fa-lock" />
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={inputs.password}
                            onChange={onChange}
                            className="auth-input"
                        />
                        <button
                            type="button"
                            className="auth-eye-btn"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? (
                                <i className="fa-solid fa-eye-slash" />
                            ) : (
                                <i className="fa-solid fa-eye" />
                            )}
                        </button>
                    </div>
                    <p
                        className={`auth-error ${
                            errors.password ? "show" : ""
                        }`}
                    >
                        {errors.password}
                    </p>
                </div>

                {errors.serverError && (
                    <p className="auth-error show">{errors.serverError}</p>
                )}

                <div className="auth-row">
                    <span />
                    {/* If you haven't built this page yet, keep "#" or remove */}
                    <Link className="auth-link" to="/auth/forgot-password">
                        Forgot your password?
                    </Link>
                </div>

                <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSubmitLoginLoading}
                >
                    {isSubmitLoginLoading ? "Signing In..." : "Sign In"}
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
