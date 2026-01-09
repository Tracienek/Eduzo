// src/page/auth/SignIn.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import "./auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const unwrap = (res) => {
    const root = res?.data ?? res;
    return root?.metadata ?? root?.data ?? root;
};

export default function SignIn() {
    const nav = useNavigate();
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
            const payload = {
                email: inputs.email.trim().toLowerCase(),
                password: inputs.password,
            };

            const res = await apiUtils.post("/auth/signIn", payload);
            const data = unwrap(res);

            const user = data?.user ?? data?.account ?? data;

            const token = data?.accessToken || data?.token;
            if (token) localStorage.setItem("accessToken", token);

            if (user?.role === "teacher") {
                nav("/workspace");
                return;
            }

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
                    <a className="auth-link" href="#">
                        Forgot your password?
                    </a>
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
