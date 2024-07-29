import React, { useEffect, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { GoogleButton } from "react-google-button";
import { auth, provider, db } from "../../config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";
import arrow from "./arrow.png";
function Navbar() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");

  useEffect(() => {
    const getMailId = async () => {
      const emailId = await localStorage.getItem("email");
      setMail(emailId);
    };
    getMailId();
  }, []);

  const logout = async () => {
    await localStorage.removeItem("email");
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In User:", user.email);

      await localStorage.setItem("email", user.email);

      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL:
          user.photoURL ||
          "https://www.pngall.com/wp-content/uploads/5/Profile.png",
      };

      // Store user data in Firestore if not already present
      const userDoc = await getDoc(doc(db, "users", user.email));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.email), userData);
      }

      // Show success toast
      toast.success("Signed in successfully with Google!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Navigate to home after a short delay
      setTimeout(() => navigate("/home"), 3000);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast.error("Google Sign-In failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navigation-navbar"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <Link className="navbar-brand navigation-navbar-brand" to="/home">
            Lets Workout
          </Link>
          <button
            className="navbar-toggler navigation-navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <img
              className="navbar-toggler-icon navigation-navbar-toggler-icon"
              // src={arrow}
              alt=""
            />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {mail ? (
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link navigation-nav-link"
                      to="/home"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link navigation-nav-link"
                      to="/profile"
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link navigation-nav-link"
                      to="/neutritionist"
                    >
                      Personal Dietician
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link navigation-nav-link"
                      to="/trainer"
                    >
                      Personal Trainer
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={logout}
                      className="nav-link navigation-btn-link"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <GoogleButton className="w-25" onClick={handleGoogleSignIn} />
                  {/* <NavLink className="nav-link navigation-nav-link" to="/">
                    Login
                  </NavLink> */}
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
