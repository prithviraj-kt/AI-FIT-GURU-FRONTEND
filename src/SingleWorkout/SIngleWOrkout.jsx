import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SingleWorkout.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Confetti from "react-confetti";

function SingleWorkout() {
  const { workout } = useParams();
  const decodedWorkoutName = decodeURIComponent(workout);
  const [work, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(10); // Default duration is 10 seconds
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startCountdown, setStartCountdown] = useState(5);

  useEffect(() => {
    const getWorkoutDetails = async () => {
      const myWorkout = await localStorage.getItem("workout");
      if (myWorkout) {
        const parsedWorkout = JSON.parse(myWorkout);
        const selectedWorkout = parsedWorkout.find(
          (item) =>
            item.name.trim().toLowerCase() ===
            decodedWorkoutName.trim().toLowerCase()
        );
        setWorkout(selectedWorkout);
        setLoading(false);
      }
    };

    getWorkoutDetails();
  }, [decodedWorkoutName]);

  useEffect(() => {
    let interval;
    if (showStartCountdown && startCountdown > 0) {
      interval = setInterval(() => {
        setStartCountdown((prev) => prev - 1);
      }, 1000);
    } else if (startCountdown === 0) {
      setShowStartCountdown(false);
      setIsWorkoutStarted(true);
    }
    return () => clearInterval(interval);
  }, [showStartCountdown, startCountdown]);

  useEffect(() => {
    if (isWorkoutStarted) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setShowSuccess(true);
            setIsWorkoutStarted(false);
            return 100;
          }
          return prevProgress + 100 / workoutDuration;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isWorkoutStarted, workoutDuration]);

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setWorkoutDuration(duration);
  };

  const SuccessAnimation = () => {
    return <Confetti width={window.innerWidth} height={window.innerHeight} />;
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h1>{work ? work.name : "Workout"}</h1>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <strong>ID:</strong> {work ? work.id : ""}
              </div>
              <div className="text-center mb-3">
                <img
                  src={work ? work.gifUrl : ""}
                  className="img-fluid"
                  alt={work ? work.name : "Workout"}
                />
              </div>
              <div className="text-center">
                <p>
                  <strong>Target:</strong> {work ? work.target : ""}
                </p>
                <p>
                  <strong>Description:</strong> {work ? work.instructions : ""}
                </p>
              </div>
              {showStartCountdown && (
                <div className="text-center mb-4">
                  <h4>Workout starting in {startCountdown} seconds...</h4>
                </div>
              )}
              {isWorkoutStarted && !showStartCountdown && (
                <div className="text-center mb-4">
                  <CountdownCircleTimer
                    isPlaying
                    duration={workoutDuration}
                    colors={["#008000"]}
                    strokeWidth={12}
                    trailColor="#d9d9d9"
                    onComplete={() => {
                      setShowSuccess(true);
                      setIsWorkoutStarted(false);
                    }}
                  >
                    {({ remainingTime }) => (
                      <div className="timer">
                        <div className="value">
                          {Math.floor(remainingTime / 60)}
                        </div>
                        <div className="text">Minutes</div>
                        <div className="value">{remainingTime % 60}</div>
                        <div className="text">Seconds</div>
                      </div>
                    )}
                  </CountdownCircleTimer>
                </div>
              )}
              {!isWorkoutStarted && !showStartCountdown && (
                <div className="text-center">
                  <label htmlFor="duration" className="form-label">
                    Enter Workout Duration (in seconds):
                  </label>
                  <input
                    type="number"
                    id="duration"
                    className="form-control mb-3"
                    value={workoutDuration}
                    onChange={handleDurationChange}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowStartCountdown(true);
                      setStartCountdown(5);
                    }}
                  >
                    Start Workout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSuccess && <SuccessAnimation />}
    </div>
  );
}

export default SingleWorkout;
