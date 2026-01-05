import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function SignIn() {
    // const { login } = useAuth();
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitLoginLoading, setIsSubmitLoginLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [inputs, setInputs] = useState({
        email: "",
        password: "",
    });
    const [email, setEmail] = useState("");

    const onChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };
    const validateInputs = () => {
        let errs = {};
        if (!inputs.email.trim()) errs.email = "Email is required";
        if (!inputs.password.trim()) errs.password = "Password is required";
        return errs;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitLoginLoading(true);

        // Basic validation
        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitLoginLoading(false);
            return;
        }

        // Call login API from AuthContext
        const result = await login(inputs.email, inputs.password);

        setIsSubmitLoginLoading(false);

        if (!result?.success) {
            setErrors({ serverError: "Invalid email or password" });
            return;
        }

        if (result?.user?.role === "teacher") {
            try {
                const res = await apiUtils.get("/teacher/readMyTeacher");
                const teacherRecord =
                    res?.data?.metadata?.patientRecord ||
                    res?.data?.patientRecord ||
                    null;
                const folderId = teacherRecord?.folderId;
                const teacherId = teacherRecord?.patientId;

                if (teacherId && folderId) {
                    nav(`/workspace/teacher/folder/${folderId}/${teacherId}`);
                    return;
                }

                const centerId = teacherRecord?.centerId;
                if (centerId) {
                    nav(`/workspace/center/${centerId}/profiles`);
                    return;
                }
            } catch (err) {
                console.error("Failed to load relative patient record", err);
            }
        }

        // Redirect after successful login
        nav("/workspace");
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
                            {showPassword ? (
                                <i className="fa-regular fa-eye-slash"></i>
                            ) : (
                                <i className="fa-regular fa-eye"></i>
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
