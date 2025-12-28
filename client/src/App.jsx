// src/App.jsx
import { useEffect } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
// import AOS from "aos";
// import "aos/dist/aos.css";

import AuthLayout from "./pages/auth/AuthLayout.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import Verification from "./pages/auth/Verification.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth/signin" replace />,
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { path: "signin", element: <SignIn /> },
            { path: "signup", element: <SignUp /> },
            { path: "verification", element: <Verification /> },
        ],
    },
    // fallback
    {
        path: "*",
        element: <Navigate to="/auth/signin" replace />,
    },
]);

export default function App() {
    // useEffect(() => {
    //     AOS.init({
    //         duration: 800,
    //         offset: 100,
    //         easing: "ease-out-cubic",
    //         once: false,
    //     });
    // }, []);

    return <RouterProvider router={router} />;
}
