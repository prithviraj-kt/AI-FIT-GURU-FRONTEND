import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Confetti from "react-confetti";
import ProgressBar from "react-progressbar";
import useSound from "use-sound";
import startSound from "./sounds/start.mp3";
import applauseSound from "./sounds/applause.mp3";
import "./SingleWorkout.css";

function SingleWorkout() {
  const { workout } = useParams();
  const decodedWorkoutName = decodeURIComponent(workout);
  const [work, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(10);
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startCountdown, setStartCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [timerMessage, setTimerMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [key, setKey] = useState(0);

  // Load sounds
  const [playStartSound] = useSound(startSound, {
    interrupt: true,
    volume: 0.5,
  });
  const [playApplauseSound, { stop: stopApplauseSound }] = useSound(
    applauseSound,
    { interrupt: true }
  );

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
      setTimerMessage("Workout started!");
    }
    return () => clearInterval(interval);
  }, [showStartCountdown, startCountdown]);

  useEffect(() => {
    if (isWorkoutStarted && !isPaused) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setShowOverlay(true);
            setShowSuccess(true);
            setIsWorkoutStarted(false);
            setTimerMessage("");
            playApplauseSound();
            return 100;
          }
          return prevProgress + 100 / workoutDuration;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isWorkoutStarted, isPaused, workoutDuration, playApplauseSound]);

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setWorkoutDuration(duration);
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
    setStartCountdown(3);
    setShowSuccess(false);
    setProgress(0);
    setTimerMessage("");
    setShowOverlay(false);
    playStartSound(); // Play the start sound immediately
    setTimeout(() => {
      setShowStartCountdown(true);
    }, 500); // Start countdown after 100ms delay
  };

  const stopWorkout = () => {
    setIsWorkoutStarted(false);
    setShowStartCountdown(false);
    setProgress(0);
    setTimerMessage("Workout stopped.");
  };

  const resetWorkout = () => {
    setIsWorkoutStarted(false);
    setShowStartCountdown(true);
    setProgress(0);
    setStartCountdown(3);
    setTimerMessage("");
    setShowOverlay(false);
    setKey((prevKey) => prevKey + 1);
    playStartSound(); // Play the start sound immediately on reset
    setTimeout(() => {
      setShowStartCountdown(true);
    }, 100); // Start countdown after 100ms delay
  };

  const SuccessAnimation = () => {
    return <Confetti width={window.innerWidth} height={window.innerHeight} />;
  };

  return (
    <div className="container-fluid workout-container">
      <div className="row justify-content-center">
        <div className="col-md-6 my-3">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h1>{work ? work.name.toUpperCase() : "Workout"}</h1>
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
            </div>
          </div>
        </div>
        <div className="col-md-6 my-3">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h1>Timer</h1>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                {showStartCountdown && !isWorkoutStarted && (
                  <ProgressBar
                    completed={(3 - startCountdown) * 33.33}
                    height="20px"
                  />
                )}

                {isWorkoutStarted && (
                  <CountdownCircleTimer
                    key={key}
                    isPlaying={!isPaused}
                    duration={workoutDuration}
                    colors={[
                      ["#004777"],
                      // ["#F7B801", workoutDuration / 3],
                      // ["#A30000", workoutDuration / 3],
                    ]}
                    strokeWidth={12}
                    trailColor="#d9d9d9"
                    onComplete={() => {
                      setShowOverlay(true);
                      setShowSuccess(true);
                      setIsWorkoutStarted(false);
                      setTimerMessage("");
                      playApplauseSound();
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
                {showStartCountdown && (
                  <div className="text-center mb-4">
                    <h4>Workout starting in {startCountdown} seconds...</h4>
                  </div>
                )}
                <div className="text-center mb-4">
                  <h4>{timerMessage}</h4>
                </div>
              </div>
              <div className="text-center">
                {isWorkoutStarted && (
                  <div className="text-center mb-4">
                    <button
                      className="btn btn-danger me-2"
                      onClick={pauseTimer}
                    >
                      Pause
                    </button>
                    <button
                      className="btn btn-success me-2"
                      onClick={resumeTimer}
                    >
                      Resume
                    </button>
                    <button
                      className="btn btn-warning me-2"
                      onClick={stopWorkout}
                    >
                      Stop
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={resetWorkout}
                    >
                      Reset
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
      </div>
      {showOverlay && (
        <div
          className="dark-overlay"
          onClick={() => {
            setShowOverlay(false);
            stopApplauseSound();
          }}
        >
          <div className="success-message">
            <h2>Congratulations! You've nailed it</h2>
            <SuccessAnimation />
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleWorkout;
