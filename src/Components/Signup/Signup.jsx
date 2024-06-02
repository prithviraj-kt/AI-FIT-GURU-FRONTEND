// import React from "yup";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleButton } from "react-google-button";
import { auth, provider } from "../../config";
import { signInWithPopup } from "firebase/auth";
const Signup = () => {
  useEffect(() => {
    validate();
  }, []);
  const handleGoogleSignIn = async () => {
    signInWithPopup(auth, provider)
      .then((data) => {
        // setValue(data.user.email);
        localStorage.setItem("email", data.user.email);
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const validate = async () => {
    const auth = await localStorage.getItem("email");
    console.log(auth);
    if (auth) {
      navigate("/home");
    }
  };
  const navigate = useNavigate();
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    name: Yup.string().required("Name is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm password is required"),
  });

  // const handleSubmit = () => {
  //   console.log(form);
  // };

  // const [form, setForm] = useState({});
  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:8080/signup",
          values
        ); // Send form data in request body
        if (response.data.msg == "User already exists") {
          alert(response.data.msg);
        } else if (response.status === 201 || response.status === 200) {
          // Handle successful response (status code might vary)
          alert(response.data.msg);
          navigate("/Login/Login");
        } else {
          console.error("Signup failed:", response.data); // Handle unexpected response status code
        }
      } catch (error) {
        console.error("Signup error:", error); // Handle errors during request
      }
    },
  });

  return (
    <div className="container-fluid d-flex flex-row">
      <div className="col-md-6 p-5">
        {/* Replace with your desired image */}
        <img
          src="path/to/your/image.jpg"
          alt="Signup Illustration"
          className="img-fluid"
        />
      </div>
      <div className="col-md-6 p-5">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className={`form-control ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
              id="email"
              // name="email"
              // onChange={(e) => handleChange(e)}
              placeholder="Enter email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="invalid-feedback">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className={`form-control ${
                formik.touched.name && formik.errors.name ? "is-invalid" : ""
              }`}
              id="name"
              // name="name"
              // onChange={(e) => handleChange(e)}
              placeholder="Enter name"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="invalid-feedback">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className={`form-control ${
                formik.touched.password && formik.errors.password
                  ? "is-invalid"
                  : ""
              }`}
              id="password"
              // name="password"
              // onChange={(e) => handleChange(e)}
              placeholder="Enter password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="invalid-feedback">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className={`form-control ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "is-invalid"
                  : ""
              }`}
              id="confirmPassword"
              placeholder="Confirm password"
              {...formik.getFieldProps("confirmPassword")}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="invalid-feedback">
                {formik.errors.confirmPassword}
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            // onClick={handleSubmit}
            className="btn btn-primary me-2"
          >
            Sign Up
          </button>
          <GoogleButton onClick={handleGoogleSignIn} />

          <p className="mt-3 text-muted">
            Already have an account?
            <a href="/login" className="text-primary">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
