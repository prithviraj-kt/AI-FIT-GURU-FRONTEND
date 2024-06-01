import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Home() {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState([]);
  useEffect(() => {
    getWorkout();
  }, []);

  const quickAccess = [
    // { id: 1, purpose: "bodyPart" },
    {
      id: 1,
      purpose: "EQUIPMENT",
      url: "https://t3.ftcdn.net/jpg/01/19/59/74/360_F_119597487_SnvLBdheEGOxu05rMQ5tCzo250cRrTz9.jpg",
    },
    {
      id: 2,
      purpose: "TARGET",
      url: "https://t4.ftcdn.net/jpg/02/51/45/49/360_F_251454966_MSoiZITSgkSgIs2qGr1SnfJOYdhd6ieJ.jpg",
    },
  ];

  const getWorkout = async () => {
    try {
      const response = await axios.get("http://localhost:8080/exercise");
      setWorkout(response.data.msg);
      await localStorage.setItem("workout", JSON.stringify(response.data.msg))
    } catch (error) {
      alert("Error occured... Please try to load again later");
    }
  };
  const handleClick = () => {
    console.log(workout);
  };

  const quickWorkout = (e) => {
    // alert(e);
    navigate(`/quickworkout/${e}`)
  };
  return (
    <div className="container-fluid">
      <div>
        <Navbar />
      </div>
      <div className="row">
        <div className="row">
          <center>
            <h1>Quick Access</h1>
          </center>
        </div>
      </div>
      {/* <div>
        <button onClick={handleClick}>Button</button>
      </div> */}
      <div className="row">
        {quickAccess.map((item) => {
          return (
            <div className="col-4">
              <div class="card">
                <img src={item.url} class="card-img-top" alt="..." />
                <div class="card-body">
                  <h5 class="card-title">{item.purpose}</h5>
                  <p class="card-text">
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </p>
                  <button
                    onClick={() => quickWorkout(item.purpose.toLowerCase())}
                    class="btn btn-primary"
                  >
                    Lets workout
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* {workout.map((item) => {
        return (
          <div className="">
            <div className="">
              <div class="card w-25 m-3">
                ID: {item.id}
                <img src={item.gifUrl} class="card-img-top" alt="..." />
                <div class="card-body">
                  <h5 class="card-title">{item.name}</h5>
                  <p class="card-text">
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </p>
                  <p>Body Part: {item.bodyPart}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })} */}
    </div>
  );
}

export default Home;
