import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleButton } from "react-google-button";
import { auth, provider } from "../../config";
import { signInWithPopup } from "firebase/auth";
// import { UserAuth } from "../Context/AuthContext";
const Login = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

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

  useEffect(() => {
    validate();
  }, []);

  const validate = async () => {
    const auth = await localStorage.getItem("email");
    console.log(auth);
    if (auth) {
      navigate("/home");
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const response = await axios.post("http://localhost:8080/login", values);

      try {
        if (response.data.msg) {
          // console.log(values.email);
          localStorage.setItem("email", values.email);
          navigate("/home");
        } else {
          alert(response.data.err);
        }
      } catch (error) {
        alert("Internam error occured");
        console.log(error);
      }

      // try {
      //   const response = await axios.get(
      //     "http://localhost:8080/login",
      //     values
      //   );
      //   if (response.status === 200) {
      //     alert(response.data.msg);
      //     // navigate("/dashboard"); // Navigate to the dashboard or desired page after successful login
      //   } else {
      //     console.error("Login failed:", response.data);
      //   }
      // } catch (error) {
      //   console.error("Login error:", error);
      // }
    },
  });

  return (
    <div className="container-fluid d-flex flex-row">
      <div className="col-md-6 p-5">
        {/* Replace with your desired image */}
        <img
          src="path/to/your/image.jpg"
          alt="Login Illustration"
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
              placeholder="Enter email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="invalid-feedback">{formik.errors.email}</div>
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
              placeholder="Enter password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="invalid-feedback">{formik.errors.password}</div>
            ) : null}
          </div>
          <button type="submit" className="btn btn-primary me-2">
            Login
          </button>
          <GoogleButton onClick={handleGoogleSignIn} />
          {/* <GoogleButton type="button" className="btn btn-outline-primary">
            Login with Google
          </GoogleButton> */}
          <p className="mt-3 text-muted">
            Don't have an account?
            <a href="/signup" className="text-primary">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
