import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleButton } from "react-google-button";
import { auth, provider, db } from "../../config"; // Import db from config
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import bcrypt from "bcryptjs";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  // Validate if user is already logged in
  useEffect(() => {
    validate();
  }, []);

  // Check if user email is already stored in localStorage
  const validate = async () => {
    const auth = await localStorage.getItem("email");
    if (auth) {
      navigate("/home");
    }
  };

  // Handle Google Sign-In
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

  // Define validation schema for the login form
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Handle form submission
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", values.email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isPasswordValid = await bcrypt.compare(
            values.password,
            userData.password
          );

          if (isPasswordValid) {
            localStorage.setItem("email", values.email);
            toast.success("Login successful!", {
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
          } else {
            toast.error("Incorrect password. Please try again.", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        } else {
          toast.error("User not found. Please sign up.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        toast.error("Internal error occurred. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log(error);
      }
    },
  });

  return (
    <div className="login-container">
      <div className="login-image-container">
        <img
          src="https://wallpaper.forfun.com/fetch/ed/ed67011f18655c66be813bab8599d3c0.jpeg"
          alt="Login Illustration"
          className="login-image"
        />
      </div>
      <div className="login-form-container">
        <form onSubmit={formik.handleSubmit} className="login-form">
          <div className="login-title">Login</div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className={`login-form-control ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
              id="email"
              placeholder="Enter email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="login-invalid-feedback">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className={`login-form-control ${
                formik.touched.password && formik.errors.password
                  ? "is-invalid"
                  : ""
              }`}
              id="password"
              placeholder="Enter password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="login-invalid-feedback">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          <button type="submit" className="login-btn-primary me-2">
            Login
          </button>
          <GoogleButton onClick={handleGoogleSignIn} />
          <p className="mt-3 login-text-muted">
            Don't have an account?{" "}
            <a href="/signup" className="login-link-primary">
              Sign Up
            </a>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
