import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./assets/css/base.scss";
import { AuthProvider } from "./context/auth/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);
