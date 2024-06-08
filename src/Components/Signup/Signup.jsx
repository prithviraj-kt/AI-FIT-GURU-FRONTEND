import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleButton } from "react-google-button";
import { auth, provider, db } from "../../config";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  // Check if the user is already authenticated
  useEffect(() => {
    validate();
  }, []);

  // Google Sign-In method
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In User:", user.email);

      await localStorage.setItem("email", user.email);

      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || "https://www.pngall.com/wp-content/uploads/5/Profile.png",
        phone: "",
      };

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.email), userData);

      // Show success toast
      toast.success("Signed up successfully with Google!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Navigate to login after a short delay
      setTimeout(() => navigate("/login"), 3000);
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

  // Validate if the user is already authenticated
  const validate = async () => {
    const auth = await localStorage.getItem("email");
    if (auth) {
      navigate("/login");
    }
  };

  // Validation schema for Formik
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    displayName: Yup.string().required("Name is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm password is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Encrypt the password using bcryptjs
        const hashedPassword = await bcrypt.hash(values.password, 10);

        const userData = {
          email: values.email,
          displayName: values.displayName,
          password: hashedPassword,
          phone: "", // Default value for phone
          photoURL: "https://www.pngall.com/wp-content/uploads/5/Profile.png", // Default photo URL
        };

        // Store user data in Firestore
        await setDoc(doc(db, "users", values.email), userData);

        // Show success toast
        toast.success("Signup successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Navigate to login after a short delay
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("Signup failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    },
  });

  return (
    <div className="signup-container">
      <div className="d-flex flex-row">
        <div className="col-md-6 p-5">
          <center>
            <img
              src="https://mfiles.alphacoders.com/683/683110.jpg"
              alt="Signup Illustration"
              className="signup-image"
            />
          </center>
        </div>
        <div className="col-md-6 p-5">
          <form onSubmit={formik.handleSubmit} className="signup-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className={`signup-form-control ${
                  formik.touched.email && formik.errors.email
                    ? "is-invalid"
                    : ""
                }`}
                id="email"
                placeholder="Enter email"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="signup-invalid-feedback">
                  {formik.errors.email}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className={`signup-form-control ${
                  formik.touched.displayName && formik.errors.displayName
                    ? "is-invalid"
                    : ""
                }`}
                id="displayName"
                placeholder="Enter name"
                {...formik.getFieldProps("displayName")}
              />
              {formik.touched.displayName && formik.errors.displayName && (
                <div className="signup-invalid-feedback">
                  {formik.errors.displayName}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`signup-form-control ${
                  formik.touched.password && formik.errors.password
                    ? "is-invalid"
                    : ""
                }`}
                id="password"
                placeholder="Enter password"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="signup-invalid-feedback">
                  {formik.errors.password}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className={`signup-form-control ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "is-invalid"
                    : ""
                }`}
                id="confirmPassword"
                placeholder="Confirm password"
                {...formik.getFieldProps("confirmPassword")}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="signup-invalid-feedback">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>
            <button type="submit" className="signup-btn-primary me-2">
              Sign Up
            </button>
            <GoogleButton onClick={handleGoogleSignIn} />
            <p className="mt-3 signup-text-muted">
              Already have an account?{" "}
              <a href="/login" className="signup-link-primary">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
