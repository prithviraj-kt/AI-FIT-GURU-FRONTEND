import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Confetti from "react-confetti";
import useSound from "use-sound";
import startSound from "./sounds/start.mp3";
import applauseSound from "./sounds/applause.mp3";
import "./Yoga.css";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function SingleYoga() {
  const { id } = useParams();
  const decodedPoseName = decodeURIComponent(id);
  const [yogaData, setYogaData] = useState([]);
  const [pose, setPose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPoseStarted, setIsPoseStarted] = useState(false);
  const [poseDuration, setPoseDuration] = useState(10);
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
  const [playApplauseSound, { stop: stopApplauseSound }] = useSound(applauseSound, { interrupt: true });

  useEffect(() => {
    fetchYogaData();
  }, []);

  useEffect(() => {
    if (yogaData.length > 0 && decodedPoseName) {
      const category = yogaData.find((item) =>
        item.poses.some((pose) => pose.sanskrit_name === decodedPoseName)
      );
      if (category) {
        const selectedPose = category.poses.find(
          (pose) => pose.sanskrit_name === decodedPoseName
        );
        setPose(selectedPose);
        setLoading(false);
      }
    }
  }, [yogaData, decodedPoseName]);

  const fetchYogaData = async () => {
    try {
      const { data } = await axios.get(
        "https://yoga-api-nzy4.onrender.com/v1/categories"
      );
      setYogaData(data);
    } catch (err) {
      console.error(err);
      setLoading(false); // Handle loading state on error
    }
  };

  useEffect(() => {
    let interval;
    if (showStartCountdown && startCountdown > 0) {
      interval = setInterval(() => {
        setStartCountdown((prev) => prev - 1);
      }, 1000);
    } else if (startCountdown === 0) {
      setShowStartCountdown(false);
      setIsPoseStarted(true);
      setTimerMessage("Pose started!");
    }
    return () => clearInterval(interval);
  }, [showStartCountdown, startCountdown]);

  useEffect(() => {
    if (isPoseStarted && !isPaused) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setShowOverlay(true);
            setShowSuccess(true);
            setIsPoseStarted(false);
            setTimerMessage("");
            playApplauseSound();
            return 100;
          }
          return prevProgress + 100 / poseDuration;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPoseStarted, isPaused, poseDuration, playApplauseSound]);

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setPoseDuration(duration);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setTimerMessage("Take a break and breathe!");
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setTimerMessage("Let's continue the pose!");
  };

  const startPose = () => {
    setShowStartCountdown(true);
    setStartCountdown(3);
    setShowSuccess(false);
    setProgress(0);
    setTimerMessage("");
    setShowOverlay(false);
    playStartSound();
    setTimeout(() => {
      setShowStartCountdown(true);
    }, 500);
  };

  const stopPose = () => {
    setIsPoseStarted(false);
    setShowStartCountdown(false);
    setProgress(0);
    setTimerMessage("Pose stopped.");
  };

  const resetPose = () => {
    setIsPoseStarted(false);
    setShowStartCountdown(true);
    setProgress(0);
    setStartCountdown(3);
    setTimerMessage("");
    setShowOverlay(false);
    setKey((prevKey) => prevKey + 1);
    playStartSound();
    setTimeout(() => {
      setShowStartCountdown(true);
    }, 100);
  };

  const SuccessAnimation = () => (
    <div className="success-animation">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={500}
        recycle={false}
        gravity={0.2}
      />
    </div>
  );

  return (
    <div className="container-fluid yoga-container">
      <Navbar />
      {loading ? (
        "Loading yoga pose..."
      ) : pose ? (
        <div className="row justify-content-center">
          <div className="col-md-6 my-3">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h1>
                  {pose
                    ? pose.english_name.charAt(0).toUpperCase() + pose.english_name.slice(1)
                    : "Yoga Pose"}
                </h1>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <img
                    src={pose ? pose.img_url : ""}
                    className="img-fluid"
                    alt={pose ? pose.english_name : "Yoga Pose"}
                  />
                </div>
                <div className="text-center">
                  <p className="text-white">
                    <strong>Target -</strong> {pose ? pose.target : "Aiyyo"}
                  </p>
                  <p className="text-white instruction-card">
                    <strong className="instruction-header">Benefits</strong>
                    {pose && pose.benefits && (
                      <div className="instruction-card-body">
                        {pose.benefits.map((benefit, index) => (
                          <p key={index} className="instruction-classname">
                            {benefit}
                          </p>
                        ))}
                      </div>
                    )}
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
                  {showStartCountdown && !isPoseStarted && (
                    <div>Countdown: {startCountdown}</div>
                  )}
                  {isPoseStarted && (
                    <CountdownCircleTimer
                      key={key}
                      isPlaying={!isPaused}
                      duration={poseDuration}
                      colors={[["#004777"]]}
                      strokeWidth={12}
                      trailColor="#d9d9d9"
                      onComplete={() => {
                        setShowOverlay(true);
                        setShowSuccess(true);
                        setIsPoseStarted(false);
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
                  <div className="text-center mb-4">
                    <h4 className="text-white">{timerMessage}</h4>
                  </div>
                </div>
                <div className="text-center">
                  {isPoseStarted && (
                    <div className="text-center mb-4">
                      <button className="btn btn-danger me-2" onClick={pauseTimer}>
                        Pause
                      </button>
                      <button className="btn btn-success me-2" onClick={resumeTimer}>
                        Resume
                      </button>
                      <button className="btn btn-warning me-2" onClick={stopPose}>
                        Stop
                      </button>
                      <button className="btn btn-secondary" onClick={resetPose}>
                        Reset
                      </button>
                    </div>
                  )}
                  {!isPoseStarted && !showStartCountdown && (
                    <div className="text-center">
                      <label htmlFor="duration" className="form-label text-white">
                        Enter Pose Duration (in seconds):
                      </label>
                      <input
                        type="number"
                        id="duration"
                        className="form-control mb-3"
                        value={poseDuration}
                        onChange={handleDurationChange}
                      />
                      <button className="btn btn-primary" onClick={startPose}>
                        Start Pose
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        "No pose found"
      )}

      {showOverlay && (
        <div
          className="dark-overlay"
          onClick={() => {
            setShowOverlay(false);
            stopApplauseSound();
          }}
        >
          <div className="success-message">
            <h2 className="text-white">Congratulations! You've nailed it</h2>
            <SuccessAnimation />
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleYoga;
