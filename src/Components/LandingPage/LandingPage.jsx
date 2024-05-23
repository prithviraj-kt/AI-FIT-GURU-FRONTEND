import React from "react";
import { useNavigate } from "react-router-dom";
function LandingPage() {
  const navigate = useNavigate();
  const login = () => {
    navigate("../Login/Login");
  };
  const signup = () => {
    navigate("../Signup/Signup");
  };

  return (
    <div>
      <div>
        <h1 className="fs-1">Landing Page</h1>
      </div>
      <div className=" m-2">
        <button onClick={login} className="bg-danger m-2 p-2">
          Login{" "}
        </button>
        <button onClick={() => signup()} className="bg-success m-2 p-2">
          Signup
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
