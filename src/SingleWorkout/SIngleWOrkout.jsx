import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SingleWorkout.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Confetti from "react-confetti";
import ProgressBar from "react-progressbar";

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
  const [isPaused, setIsPaused] = useState(false);
  const [timerMessage, setTimerMessage] = useState("");

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
    if (isWorkoutStarted && !isPaused) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setShowSuccess(true);
            setIsWorkoutStarted(false);
            setTimerMessage("");
            return 100;
          }
          return prevProgress + 100 / workoutDuration;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isWorkoutStarted, isPaused, workoutDuration]);

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setWorkoutDuration(duration);
  };

  const SuccessAnimation = () => {
    return <Confetti width={window.innerWidth} height={window.innerHeight} />;
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setTimerMessage("Don't stop, continue working out!");
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setTimerMessage("Let's goooo!");
  };

  const startWorkout = () => {
    setShowStartCountdown(true);
    setStartCountdown(5);
    setShowSuccess(false); // Reset the success message
    setProgress(0); // Reset the progress
    setTimerMessage(""); // Reset the timer message
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
              <div className="text-center mb-4">
                {showStartCountdown && !isWorkoutStarted && (
                  <ProgressBar
                    completed={(5 - startCountdown) * 20}
                    height="20px"
                  />
                )}
                {isWorkoutStarted && (
                  <CountdownCircleTimer
                    isPlaying={!isPaused}
                    duration={workoutDuration}
                    colors={[
                      ["#004777"],
                      //   ["#F7B801", workoutDuration / 3],
                      //   ["#A30000", workoutDuration / 3],
                    ]}
                    strokeWidth={12}
                    trailColor="#d9d9d9"
                    onComplete={() => {
                      setShowSuccess(true);
                      setIsWorkoutStarted(false);
                      setTimerMessage("");
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
                )}
              </div>
              <div className="text-center mb-4">
                <h4>{timerMessage}</h4>
              </div>
              {showStartCountdown && (
                <div className="text-center mb-4">
                  <h4>Workout starting in {startCountdown} seconds...</h4>
                </div>
              )}
              {isWorkoutStarted && (
                <div className="text-center mb-4">
                  <button className="btn btn-danger" onClick={pauseTimer}>
                    Pause
                  </button>{" "}
                  <button className="btn btn-success" onClick={resumeTimer}>
                    Resume
                  </button>
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
                  <button className="btn btn-primary" onClick={startWorkout}>
                    Start Workout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSuccess && (
        <div className="text-center mt-4">
          <h2>Congratulations! You've completed the workout!</h2>
          <div className="text-center mt-2">
            <SuccessAnimation />
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleWorkout;
