// src/page/auth/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest"; // chỉnh path đúng project bạn
import "./auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const unwrap = (res) => {
    const root = res?.data ?? res;
    return root?.metadata ?? root?.data ?? root;
};

export default function SignUp() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [inputs, setInputs] = useState({
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        centers: "", // nếu BE cần
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setInputs((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "", serverError: "" }));
    };

    const validateInputs = () => {
        const errs = {};
        if (!inputs.fullName.trim())
            errs.fullName = "Please enter your full name";
        if (!inputs.email.trim()) errs.email = "Please enter your email";
        if (!inputs.password.trim()) errs.password = "Please enter a password";
        if (!inputs.confirmPassword.trim())
            errs.confirmPassword = "Please confirm your password";
        else if (inputs.confirmPassword !== inputs.password)
            errs.confirmPassword = "Passwords do not match";

        // nếu BE yêu cầu centers thì giữ, không thì xoá đoạn này + field
        if (!inputs.centers?.toString().trim())
            errs.centers = "Please select centers count";

        return errs;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                email: inputs.email.trim().toLowerCase(),
                fullName: inputs.fullName.trim(),
                password: inputs.password,
                centers: inputs.centers,
            };

            const res = await apiUtils.post("/auth/signUp", payload);
            const data = unwrap(res);

            // nếu BE trả OTP flow:
            // navigate("/auth/verification", { state: { email: inputs.email } });

            // nếu BE sign up xong cho login luôn:
            // const token = data?.accessToken || data?.token;
            // if (token) localStorage.setItem("token", token);

            // mặc định: về sign-in
            navigate("/auth/signIn");
        } catch (err) {
            setErrors({
                serverError:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Registration failed. Try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <h2 className="auth-title">Sign Up</h2>
            <p className="auth-subtitle">Create your teacher account</p>

            <form className="auth-form" onSubmit={onSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <i className="fa-solid fa-user" />
                        </span>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={inputs.fullName}
                            onChange={onChange}
                            className="auth-input"
                        />
                    </div>
                    <p
                        className={`auth-error ${
                            errors.fullName ? "show" : ""
                        }`}
                    >
                        {errors.fullName}
                    </p>
                </div>

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

                {/* centers: nếu BE cần */}
                <div className="auth-field">
                    <label className="auth-label">Centers</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <i className="fa-solid fa-building" />
                        </span>
                        <select
                            name="centers"
                            value={inputs.centers}
                            onChange={onChange}
                            className="auth-input"
                        >
                            <option value="">Select centers count</option>
                            <option value="1">1 center</option>
                            <option value="2">2 centers</option>
                            <option value="3">3 centers</option>
                        </select>
                    </div>
                    <p className={`auth-error ${errors.centers ? "show" : ""}`}>
                        {errors.centers}
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

                <div className="auth-field">
                    <label className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <i className="fa-solid fa-lock" />
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={inputs.confirmPassword}
                            onChange={onChange}
                            className="auth-input"
                        />
                    </div>
                    <p
                        className={`auth-error ${
                            errors.confirmPassword ? "show" : ""
                        }`}
                    >
                        {errors.confirmPassword}
                    </p>
                </div>

                {errors.serverError && (
                    <p className="auth-error show">{errors.serverError}</p>
                )}

                <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link className="auth-link" to="/auth/signIn">
                        Sign in
                    </Link>
                </div>
            </form>
        </>
    );
}
