import logo from "./logo.svg";
// import "./App.css";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import LandingPage from "../src/Components/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
import Home from "./Components/Home/Home";
import QuickWorkout from "./Components/QuickWorkout/QuickWorkout";
import SIngleWOrkout from "./Components/SingleWorkout/SIngleWOrkout";
import { AuthContextProvider } from "./Components/Context/AuthContext";
import Navbar from "./Components/Navbar/Navbar";
import Profile from "./Components/Profile/Profile";
import WorkoutPlanBot from "./Components/Bots/trainer";
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
      {/* <AuthContextProvider> */}

      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route
            exact
            path="/quickworkout/:purpose"
            element={<QuickWorkout />}
          />
          <Route exact path="/:workout" element={<SIngleWOrkout />} />
          <Route exact path="/aibot" element={<WorkoutPlanBot />} />
        </Routes>
      </BrowserRouter>
      {/* </AuthContextProvider> */}
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
