import "./header.css";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const Header = () => {
    return (
        <header className="lp-header">
            <div className="lp-container">
                <div className="lp-nav">
                    {/* <div className="lp-brand">
                            <div className="lp-brand-badge">E</div>
                            <span>EDUZO</span>
                        </div> */}
                    <Link to="/" className="lp-brand">
                        <img
                            src={logo}
                            alt="Eduzo logo"
                            className="lp-brand-badge"
                        />
                        <span className="lp-brand-text">EDUZO</span>
                    </Link>
                    <nav
                        // className={`se-nav ${
                        //     isMobileOpen ? "se-nav--open" : ""
                        // }`}
                        // aria-hidden={!isMobileOpen}
                        className="lp-actions"
                    >
                        <Link
                            to="/"
                            className="lp-links"
                            // onClick={closeMobile}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className="lp-links"
                            // onClick={closeMobile}
                        >
                            About us
                        </Link>
                        <Link
                            to="/services"
                            className="lp-links"
                            // onClick={closeMobile}
                        >
                            Services
                        </Link>
                    </nav>

                    <div className="lp-actions">
                        <Link className="lp-links" to="/auth/signin">
                            Sign in
                        </Link>
                        <Link className="lp-action-btn" to="/auth/signUp">
                            Start free trial
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
