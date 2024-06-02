import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState([]);
  useEffect(() => {
    auth();
    getWorkout();
  }, []);

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
      purpose: "bodyWeight",
      url: "https://www.shutterstock.com/image-photo/very-strong-caucasian-boy-doing-600nw-1870337767.jpg",
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

  const handleClick = () => {
    console.log(workout);
  };

  const quickWorkout = (e) => {
    navigate(`/quickworkout/${e}`);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="row">
          <center>
            <h1>Quick Access</h1>
          </center>
        </div>
      </div>
      <div className="row quick-access-container">
        {quickAccess.map((item) => (
          <div
            key={item.id}
            className="quick-access-item col-md-6 col-lg-4 mb-3 animate__animated animate__fadeIn"
          >
            <div className="card h-100 shadow-sm">
              <img
                src={item.url}
                className="card-img-top"
                alt={item.purpose.toUpperCase()}
              />
              <div className="card-body">
                <h5 className="card-title">{item.purpose.toUpperCase()}</h5>
                {/* <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p> */}
                <button
                  onClick={() => quickWorkout(item.purpose)}
                  className="btn btn-primary"
                >
                  Let's workout
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* {workout.map((item) => (
        <div key={item.id} className="col-md-4 mb-3 animate__animated animate__fadeIn">
          <div className="card shadow-sm">
            <img src={item.gifUrl} className="card-img-top" alt={item.name} />
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text">
                Some quick example text to build on the card title and make
                up the bulk of the card's content.
              </p>
              <p>Body Part: {item.bodyPart}</p>
            </div>
          </div>
        </div>
      ))} */}
    </div>
  );
}

export default Home;
