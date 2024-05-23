import logo from "./logo.svg";
import "./App.css";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import LandingPage from "../src/Components/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
function App() {
  // const [value, setValue] = useState("");
  // const handleClick = () => {
  //   signInWithPopup(auth, provider).then(async (data) => {
  //     setValue(data.user.email);
  //     await localStorage.setItem("email", data.user);
  //   });
  // };

  // useEffect(() => {
  //   setValue(localStorage.getItem("email"));
  // });

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/Signup/Signup" element={<Signup />} />
          <Route exact path="/Login/Login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      {/* {value ? (
        <Home />
      ) : (
        <button className="custom-google-button" onClick={handleClick}>
          
          Signin with Google
        </button>
      )} */}
    </div>
  );
}

export default App;
