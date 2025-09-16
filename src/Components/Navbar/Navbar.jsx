import React, { useEffect, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { GoogleButton } from "react-google-button";
import { auth, provider, db } from "../../config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const emailId = localStorage.getItem("email");
    if (emailId) setMail(emailId);
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  // Handle body padding when mobile menu is open
  useEffect(() => {
    const updateBodyPadding = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        if (menuOpen) {
          document.body.style.paddingTop = "200px"; // Extra space for mobile menu
        } else {
          document.body.style.paddingTop = "70px"; // Normal mobile navbar height
        }
      } else {
        document.body.style.paddingTop = "80px"; // Desktop navbar height
        setMenuOpen(false); // Close menu when switching to desktop
      }
    };

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateBodyPadding);
      document.body.style.paddingTop = "80px";
    };
  }, [menuOpen]);

  const logout = async () => {
    await localStorage.removeItem("email");
    toast.info("Logged out successfully!", { autoClose: 2000 });
    setTimeout(() => navigate("/"), 2000);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await localStorage.setItem("email", user.email);

      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL:
          user.photoURL ||
          "https://www.pngall.com/wp-content/uploads/5/Profile.png",
      };

      const userDoc = await getDoc(doc(db, "users", user.email));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.email), userData);
      }

      toast.success("Signed in successfully with Google!", { autoClose: 2000 });
      setTimeout(() => navigate("/home"), 2000);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast.error("Google Sign-In failed. Please try again.", { autoClose: 2000 });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <>
      <ToastContainer />
      <nav className="navigation-navbar">
        <div className="navigation-container">
          <Link className="navigation-brand" to="/home">
            🏋️‍♂️ Lets Workout
          </Link>

          <div className="navigation-actions">
            {/* Desktop navigation links */}
            <div className="navigation-links-desktop">
              {mail ? (
                <>
                  <NavLink 
                    to="/home" 
                    className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/profile" 
                    className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                  >
                    Profile
                  </NavLink>
                  <NavLink 
                    to="/neutritionist" 
                    className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                  >
                    Dietician
                  </NavLink>
                  <NavLink 
                    to="/trainer" 
                    className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                  >
                    Trainer
                  </NavLink>
                  <NavLink 
                    to="https://d24g442oi5klok.cloudfront.net/" 
                    className="navigation-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Meet the engineer
                  </NavLink>
                  <button onClick={logout} className="navigation-btn">
                    Logout
                  </button>
                </>
              ) : (
                <GoogleButton className="google-btn" onClick={handleGoogleSignIn} />
              )}
            </div>

            {/* Mobile toggle button */}
            <button
              className="nav-toggle"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`navigation-links-mobile ${menuOpen ? "open" : ""}`}>
          {mail ? (
            <>
              <NavLink 
                to="/home" 
                className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink 
                to="/neutritionist" 
                className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Dietician
              </NavLink>
              <NavLink 
                to="/trainer" 
                className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Trainer
              </NavLink>
              <NavLink 
                to="https://d24g442oi5klok.cloudfront.net/" 
                className="navigation-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Developer
              </NavLink>
              <button onClick={logout} className="navigation-btn">
                Logout
              </button>
            </>
          ) : (
            <GoogleButton className="google-btn" onClick={handleGoogleSignIn} />
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
