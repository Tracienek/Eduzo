import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
        centers: "",
    });

    const onChange = (e) => {
        const { name, value } = e.target;

        setInputs((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
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
        if (!inputs.centers.trim())
            errs.centers = "Please select centers count";
        return errs;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                email: inputs.email,
                fullName: inputs.fullName,
                password: inputs.password,
                centers: inputs.centers,
            };

            // const res = await apiUtils.post("/auth/signUp", payload);

            // demo điều hướng:
            navigate("/auth/verification", { state: { email: inputs.email } });
        } catch (err) {
            setErrors({
                serverError: "Registration failed. Try again.",
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
                            <i className="fa-solid fa-user"></i>
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
                            <i className="fa-solid fa-envelope"></i>
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
                            <i className="fa-solid fa-lock"></i>
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
                        >
                            {/* nếu regular không hiện thì đổi sang fa-solid */}
                            {showPassword ? (
                                <i className="fa-solid fa-eye-slash"></i>
                            ) : (
                                <i className="fa-solid fa-eye"></i>
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
                            <i className="fa-solid fa-lock"></i>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={inputs.confirmPassword}
                            onChange={onChange}
                            className="auth-input"
                        />
                        <button
                            type="button"
                            className="auth-eye-btn"
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            {showPassword ? (
                                <i className="fa-solid fa-eye-slash"></i>
                            ) : (
                                <i className="fa-solid fa-eye"></i>
                            )}
                        </button>
                    </div>
                    <p
                        className={`auth-error ${
                            errors.confirmPassword ? "show" : ""
                        }`}
                    >
                        {errors.confirmPassword}
                    </p>
                </div>

                <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
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
