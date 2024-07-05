import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PersonalWorkout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlay,
  faPause,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import tickSound from "./start.wav";
import clappingSound from "./applause.mp3";
import Navbar from "../Navbar/Navbar";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
const PersonalWorkout = () => {
  const navigate = useNavigate();
  const [personalWorkout, setPersonalWorkout] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(15000);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const timerId = useRef(null);
  const breakTimerId = useRef(null);
  const audioRef = useRef(null);
  const clappingAudioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(tickSound);
    clappingAudioRef.current = new Audio(clappingSound);
  }, []);

  useEffect(() => {
    const auth = async () => {
      const email = await localStorage.getItem("email");
      if (!email) {
        navigate("/login");
      }
    };
    auth();

    const getPersonalWorkout = async () => {
      const personalworkout = await localStorage.getItem("personalworkout");
      const workout = await localStorage.getItem("workout");
      if (personalworkout && workout) {
        setPersonalWorkout(JSON.parse(personalworkout));
        setWorkoutData(JSON.parse(workout));
      }
    };
    getPersonalWorkout();
  }, [navigate]);

  useEffect(() => {
    const matchedWorkout = workoutData.find(
      (workout) =>
        personalWorkout[currentWorkoutIndex] &&
        workout.name === personalWorkout[currentWorkoutIndex].name
    );

    if (matchedWorkout) {
      setTimeRemaining(matchedWorkout.length * 1000 || 60000);
    }
  }, [currentWorkoutIndex, personalWorkout, workoutData]);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 1000) {
      const soundInterval = setInterval(() => {
        audioRef.current.play();
      }, 1000);

      return () => clearInterval(soundInterval);
    } else if (timeRemaining <= 1000 && isTimerRunning) {
      audioRef.current.play();
    }
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerId.current = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1000);
      }, 1000);
    } else {
      clearTimeout(timerId.current);
      if (timeRemaining === 0 && isTimerRunning) {
        setIsTimerRunning(false);
        if (currentWorkoutIndex === personalWorkout.length - 1) {
          setWorkoutCompleted(true);
          clappingAudioRef.current.play();
        } else {
          setIsBreakTime(true);
        }
      }
    }

    return () => clearTimeout(timerId.current);
  }, [
    isTimerRunning,
    timeRemaining,
    currentWorkoutIndex,
    personalWorkout.length,
  ]);

  useEffect(() => {
    if (isBreakTime && breakTimeRemaining > 0) {
      breakTimerId.current = setTimeout(() => {
        setBreakTimeRemaining((prevTime) => prevTime - 1000);
      }, 1000);
    } else if (breakTimeRemaining === 0) {
      setIsBreakTime(false);
      setBreakTimeRemaining(15000);
      handleNextWorkout();
    }

    return () => clearTimeout(breakTimerId.current);
  }, [isBreakTime, breakTimeRemaining]);

  const handleStartPause = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      if (countdown === null) {
        setCountdown(5);
      }
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(true);
      setCountdown(null);
    }
  }, [countdown]);

  const handleReset = () => {
    setIsTimerRunning(false);
    const matchedWorkout = workoutData.find(
      (workout) =>
        personalWorkout[currentWorkoutIndex] &&
        workout.name === personalWorkout[currentWorkoutIndex].name
    );
    if (matchedWorkout) {
      setTimeRemaining(matchedWorkout.length * 1000 || 60000);
    }
  };

  const handleNextWorkout = () => {
    setCurrentWorkoutIndex(
      (prevIndex) => (prevIndex + 1) % personalWorkout.length
    );
  };

  const handlePreviousWorkout = () => {
    setCurrentWorkoutIndex(
      (prevIndex) =>
        (prevIndex - 1 + personalWorkout.length) % personalWorkout.length
    );
  };

  const formatTime = (timeInMillis) => {
    const minutes = Math.floor(timeInMillis / 60000);
    const seconds = Math.floor((timeInMillis % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const currentWorkout =
    personalWorkout.length > 0 && workoutData.length > 0
      ? workoutData.find(
          (workout) =>
            workout.name === personalWorkout[currentWorkoutIndex]?.name
        )
      : null;

  const percentage =
    timeRemaining !== null
      ? (timeRemaining / (currentWorkout?.length * 1000 || 60000)) * 100
      : 0;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(tickSound);
    clappingAudioRef.current = new Audio(clappingSound);
  }, []);

  useEffect(() => {
    // Start confetti when workoutCompleted becomes true
    if (workoutCompleted) {
      setShowConfetti(true);

      // Optionally, stop confetti after a few seconds (e.g., 5 seconds)
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [workoutCompleted]);

  return (
    <div className="personalworkout-container">
      <Navbar />
      <div className="personalworkout-content">
        {workoutCompleted ? (
          <div className="workout-completed-message">
            {showConfetti && <Confetti />} {/* Render Confetti */}
            <h2>Congratulations! You've completed your workout!</h2>
            <h3>Come back tomorrow</h3>
            {/* <div className="animation-container">
              <div className="flower-shower"></div>
            </div> */}
          </div>
        ) : currentWorkout ? (
          <div className="personalworkout-workout-item">
            <h4>{currentWorkout.name.toUpperCase()}</h4>
            <div className="row">
              <div className="col-md-6 order-1 order-md-1">
                <div className="img w-75">
                  <img
                    src={currentWorkout.gifUrl}
                    className="personalworkout-workout-gif"
                  />
                </div>
              </div>
              <div className="col-md-6 order-3 order-md-2">
                <div className="workout-info">
                  {countdown !== null ? (
                    <div className="countdown-timer">
                      <p>Workout starts in {countdown}</p>
                    </div>
                  ) : isBreakTime ? (
                    <div className="break-timer">
                      <p>
                        Next workout starts in {formatTime(breakTimeRemaining)}
                      </p>
                    </div>
                  ) : (
                    <div style={{ width: 200, height: 200 }}>
                      <CircularProgressbar
                        value={percentage}
                        text={formatTime(timeRemaining)}
                        styles={buildStyles({
                          textColor: "#fff",
                          pathColor: "#4caf50",
                          trailColor: "#d6d6d6",
                        })}
                      />
                    </div>
                  )}
                  <div className="personalworkout-workout-header mt-5"></div>
                  <div className="personalworkout-controls mt-5">
                    <button
                      onClick={handlePreviousWorkout}
                      disabled={currentWorkoutIndex === 0}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button onClick={handleStartPause}>
                      <FontAwesomeIcon
                        icon={isTimerRunning ? faPause : faPlay}
                      />
                    </button>
                    <button onClick={handleReset}>
                      <FontAwesomeIcon icon={faRedo} />
                    </button>
                    <button
                      onClick={handleNextWorkout}
                      disabled={
                        currentWorkoutIndex === personalWorkout.length - 1
                      }
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ol className="personalworkout-instructions-list">
              {currentWorkout.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="personalworkout-no-workouts">
            {personalWorkout.length === 0
              ? "No workouts in your plan."
              : "Loading workouts..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalWorkout;
