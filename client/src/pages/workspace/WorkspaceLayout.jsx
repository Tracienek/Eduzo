import { Outlet, NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./WorkspaceLayout.css";
import logo from "../../assets/images/logo.png";
import WorkspaceTopBar from "../../components/workspace/WorkspaceTopBar";

export default function WorkspaceLayout() {
    const navClass = ({ isActive }) =>
        `workspace-nav-link${isActive ? " active" : ""}`;

    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("ws_collapsed");
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem("ws_collapsed", JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <div className="workspace">
            <aside
                className={`workspace-sidebar ${collapsed ? "collapsed" : ""}`}
            >
                <div className="workspace-brand-row">
                    <Link to="/workspace" className="workspace-brand">
                        <img
                            src={logo}
                            alt="EDUZO logo"
                            className="workspace-logo"
                        />
                        <div className="workspace-brand-name">EDUZO</div>
                    </Link>

                    <button
                        type="button"
                        className="workspace-toggle"
                        onClick={() => setCollapsed((v) => !v)}
                        aria-label={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        title={collapsed ? "Mở rộng" : "Thu gọn"}
                    >
                        {collapsed ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20"
                                viewBox="0 -960 960 960"
                                width="20"
                                fill="currentColor"
                            >
                                <path d="M640-240 584-296l184-184-184-184 56-56 240 240-240 240ZM80-240v-80h360v80H80Zm0-200v-80h360v80H80Zm0-200v-80h360v80H80Z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20"
                                viewBox="0 -960 960 960"
                                width="20"
                                fill="currentColor"
                            >
                                <path d="M320-240 80-480l240-240 56 56-184 184 184 184-56 56Zm560 0H520v-80h360v80Zm0-200H520v-80h360v80Zm0-200H520v-80h360v80Z" />
                            </svg>
                        )}
                    </button>
                </div>

                <nav className="workspace-nav">
                    <ul>
                        <li>
                            <NavLink
                                to="/workspace/classes"
                                className={navClass}
                            >
                                <span className="workspace-nav-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20"
                                        viewBox="0 -960 960 960"
                                        width="20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M120-120v-520l360-180 360 180v520H120Zm80-80h120v-160H200v160Zm200 0h120v-160H400v160Zm200 0h120v-360L480-760 200-560v360Zm-360-240h80v-80h-80v80Zm160 0h80v-80h-80v80Z" />
                                    </svg>
                                </span>
                                <span className="workspace-nav-text">
                                    Classes
                                </span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/workspace/staffs"
                                className={navClass}
                            >
                                <span className="workspace-nav-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20"
                                        viewBox="0 -960 960 960"
                                        width="20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Z" />
                                    </svg>
                                </span>
                                <span className="workspace-nav-text">
                                    Staffs
                                </span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/workspace/notifications"
                                className={navClass}
                            >
                                <span className="workspace-nav-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20"
                                        viewBox="0 -960 960 960"
                                        width="20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M192-216v-72h48v-240q0-87 53.5-153T432-763v-53q0-20 14-34t34-14q20 0 34 14t14 34v53q85 16 138.5 82T720-528v240h48v72H192Z" />
                                    </svg>
                                </span>
                                <span className="workspace-nav-text">
                                    Notifications
                                </span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="workspace-footer">
                    <p>Copyright © 2025 EDUZO.</p>
                    <img
                        src={logo}
                        alt="EDUZO logo small"
                        className="workspace-footer-logo"
                    />
                </div>
            </aside>

            <div className="workspace-content">
                <WorkspaceTopBar />
                <main className="workspace-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
