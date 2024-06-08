import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../Navbar/Navbar";

function Home() {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState([]);

  useEffect(() => {
    auth();
    getWorkout();
    getUser();
  }, []);

  const getUser = async () => {
    const email = await localStorage.getItem("email");
    // console.log(email);
    await axios
      .get(`http://localhost:8080/getuser/${email}`)
      .then(async (succ) => {
        const stringFormatUser = JSON.stringify(succ.data.msg[0]);
        await localStorage.setItem("user", stringFormatUser);
      })
      .catch((err) => {
        alert(
          "Internal error occured, please try again later",
          err.data.msg[0]
        );
        navigate("/login");
      });
  };

  const auth = () => {
    const auth = localStorage.getItem("email");
    if (!auth) {
      navigate("/login");
    }
  };

  const quickAccess = [
    {
      id: 1,
      purpose: "equipment",
      url: "https://t3.ftcdn.net/jpg/01/19/59/74/360_F_119597487_SnvLBdheEGOxu05rMQ5tCzo250cRrTz9.jpg",
    },
    {
      id: 2,
      purpose: "bodyPart",
      url: "https://t4.ftcdn.net/jpg/02/51/45/49/360_F_251454966_MSoiZITSgkSgIs2qGr1SnfJOYdhd6ieJ.jpg",
    },
    {
      id: 3,
      purpose: "cardio",
      url: "https://img.freepik.com/premium-photo/energetic-sportsman-is-doing-heavy-cardio-cross-fit-training-with-battle-ropes-indoor-gym-with-black-background-big-mirror_232070-11719.jpg",
    },
    {
      id: 4,
      purpose: "calisthenics",
      url: "https://www.shutterstock.com/image-photo/very-strong-caucasian-boy-doing-600nw-1870337767.jpg",
    },
    {
      id: 5,
      purpose: "yoga",
      url: "https://t4.ftcdn.net/jpg/05/21/08/41/360_F_521084195_tYS2okL4X2UWsiCzuODpzjxZ3EyF1amu.jpg",
    },
  ];

  const getWorkout = async () => {
    try {
      const response = await axios.get("http://localhost:8080/exercise");
      setWorkout(response.data.msg);
      await localStorage.setItem("workout", JSON.stringify(response.data.msg));
    } catch (error) {
      alert("Error occurred... Please try to load again later");
    }
  };

  const quickWorkout = (e) => {
    if (e != "yoga") {
      navigate(`/quickworkout/${e}`);
    } else {
      alert("Page under construction, please wait");
    }
  };

  return (
    <div className="home-container-fluid">
      <div className="home-row">
        <Navbar />
      </div>
      <div className="home-row">
        <div className="home-row">
          <center>
            <h1 className="home-title">Quick Access</h1>
          </center>
        </div>
      </div>
      <div className="home-row home-quick-access-wrapper">
        <div className="home-quick-access-container">
          {quickAccess.map((item) => (
            <div
              key={item.id}
              className="home-quick-access-item col-md-6 col-lg-4 mb-3 animate__animated animate__fadeIn"
            >
              <div className="home-card h-100 shadow-sm">
                <img
                  src={item.url}
                  className="home-card-img-top"
                  alt={item.purpose.toUpperCase()}
                />
                <div className="home-card-body">
                  <h5 className="home-card-title">
                    {item.purpose.toUpperCase()}
                  </h5>
                  <button
                    onClick={() => quickWorkout(item.purpose)}
                    className="home-btn-primary"
                  >
                    Let's workout
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
