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

  useEffect(() => {
    const emailId = localStorage.getItem("email");
    if (emailId) setMail(emailId);
  }, []);

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

  return (
    <>
      <ToastContainer />
      <nav className="navigation-navbar">
        <div className="navigation-container">
          <Link className="navigation-brand" to="/home">
            🏋️‍♂️ Lets Workout
          </Link>

          <div className="navigation-links">
            {mail ? (
              <>
                <NavLink to="/home" className="navigation-link">
                  Home
                </NavLink>
                <NavLink to="/profile" className="navigation-link">
                  Profile
                </NavLink>
                <NavLink to="/neutritionist" className="navigation-link">
                  Dietician
                </NavLink>
                <NavLink to="/trainer" className="navigation-link">
                  Trainer
                </NavLink>
                <NavLink to="https://d24g442oi5klok.cloudfront.net/" className="navigation-link">
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
        </div>
      </nav>
    </>
  );
}

export default Navbar;
