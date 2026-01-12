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
// import Layout from "./components/layout/Layout.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
// import About from "./pages/landing/About.jsx";
import Services from "./pages/services/Services.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import WorkspaceLayout from "./pages/workSpace/WorkspaceLayout.jsx";
import ClassesPage from "./pages/workspace/classes/ClassesPage.jsx";
import ClassDetailPage from "./pages/workspace/classes/classDetail/ClassDetailPage.jsx";
import FullAttendancePage from "./pages/workspace/classes/attendance/FullAttendancePage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicLayout />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: "services", element: <Services /> },
        ],
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
    {
        path: "/workspace",
        element: <WorkspaceLayout />,
        children: [
            { index: true, element: <Navigate to="classes" replace /> },

            { path: "classes", element: <ClassesPage /> },
            { path: "classes/:classId", element: <ClassDetailPage /> },
            {
                path: "classes/:classId/attendance",
                element: <FullAttendancePage />,
            },
        ],
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
