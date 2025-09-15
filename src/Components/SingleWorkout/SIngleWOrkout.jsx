import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Confetti from "react-confetti";
import useSound from "use-sound";
import startSound from "./sounds/start.mp3";
import applauseSound from "./sounds/applause.mp3";
import Navbar from "../Navbar/Navbar";
import {
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Target,
  Clock,
  Award,
  ChevronRight,
  Info,
  X,Dumbbell
} from "lucide-react";

function SingleWorkout() {
  const { workout } = useParams();
  const decodedWorkoutName = decodeURIComponent(workout);
  const [work, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startCountdown, setStartCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [timerMessage, setTimerMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [key, setKey] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  // Futuristic color palette
  const colors = {
    primary: "#6366F1",      // Electric indigo
    secondary: "#10B981",    // Emerald green
    accent: "#F59E0B",       // Amber
    dark: "#0F172A",         // Deep navy
    lightDark: "#1E293B",    // Lighter navy
    light: "#F1F5F9",        // Light background
    textPrimary: "#E2E8F0",  // Light text
    textSecondary: "#94A3B8" // Muted text
  };

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
      setTimerMessage("Workout started! Let's go!");
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
    setTimerMessage("Workout paused. Ready to continue?");
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setTimerMessage("Resuming workout! Keep going!");
  };

  const startWorkout = () => {
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
    playStartSound();
    setTimeout(() => {
      setShowStartCountdown(true);
    }, 100);
  };

  const SuccessAnimation = () => {
    return (
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
  };

  return (
    <div style={{ 
      backgroundColor: colors.dark, 
      minHeight: "100vh", 
      color: colors.textPrimary,
      paddingTop: "76px"
    }}>
      <Navbar />
      
      {!work ? (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "calc(100vh - 76px)" 
        }}>
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            background: colors.lightDark, 
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h2 style={{ color: colors.textPrimary, marginBottom: "20px" }}>Workout Not Found</h2>
            <p style={{ color: colors.textSecondary }}>The requested workout could not be found.</p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "20px",
            marginBottom: "20px"
          }}>
            {/* Workout Details Card */}
            <div style={{
              background: colors.lightDark,
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "20px",
                paddingBottom: "15px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <h1 style={{ 
                  color: colors.textPrimary, 
                  margin: 0, 
                  fontSize: "1.8rem",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  {work.name.charAt(0).toUpperCase() + work.name.slice(1)}
                </h1>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: showInstructions ? `${colors.primary}20` : "rgba(255, 255, 255, 0.05)",
                    color: showInstructions ? colors.primary : colors.textPrimary,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Info size={16} />
                  <span>{showInstructions ? "Hide Instructions" : "Show Instructions"}</span>
                </button>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginBottom: "20px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
              }}>
                <img
                  src={work.gifUrl}
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover"
                  }}
                  alt={work.name}
                />
              </div>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginBottom: "15px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px"
              }}>
                <Target size={20} color={colors.primary} />
                <div>
                  <div style={{ fontSize: "0.9rem", color: colors.textSecondary }}>Target Muscle</div>
                  <div style={{ fontSize: "1rem", color: colors.textPrimary, fontWeight: "500" }}>{work.target}</div>
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginBottom: "15px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px"
              }}>
                <Dumbbell size={20} color={colors.secondary} />
                <div>
                  <div style={{ fontSize: "0.9rem", color: colors.textSecondary }}>Equipment</div>
                  <div style={{ fontSize: "1rem", color: colors.textPrimary, fontWeight: "500" }}>{work.equipment || "Body Weight"}</div>
                </div>
              </div>
              
              {showInstructions && work.instructions && (
                <div style={{ 
                  marginTop: "20px",
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <h3 style={{ 
                    color: colors.textPrimary, 
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <Info size={18} />
                    Instructions
                  </h3>
                  <div style={{ color: colors.textSecondary }}>
                    {work.instructions.map((instruction, index) => (
                      <div key={index} style={{ 
                        display: "flex", 
                        alignItems: "flex-start", 
                        gap: "10px", 
                        marginBottom: "10px",
                        padding: "8px 0"
                      }}>
                        <div style={{
                          minWidth: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "#fff"
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>{instruction}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timer Card */}
            <div style={{
              background: colors.lightDark,
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "20px",
                paddingBottom: "15px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <h2 style={{ 
                  color: colors.textPrimary, 
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <Clock size={24} color={colors.primary} />
                  Workout Timer
                </h2>
                <div style={{ 
                  padding: "6px 12px", 
                  background: "rgba(255, 255, 255, 0.05)", 
                  borderRadius: "20px", 
                  fontSize: "0.85rem",
                  color: colors.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <Target size={14} />
                  <span>{work.target}</span>
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                flex: 1,
                margin: "20px 0"
              }}>
                {showStartCountdown && !isWorkoutStarted && (
                  <div style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    border: `2px solid ${colors.primary}`
                  }}>
                    <div style={{ 
                      fontSize: "4rem", 
                      fontWeight: "bold", 
                      color: colors.primary,
                      textShadow: `0 0 20px ${colors.primary}80`
                    }}>
                      {startCountdown}
                    </div>
                    <div style={{ color: colors.textSecondary, marginTop: "10px" }}>
                      Starting in...
                    </div>
                  </div>
                )}
                
                {isWorkoutStarted && (
                  <CountdownCircleTimer
                    key={key}
                    isPlaying={!isPaused}
                    duration={workoutDuration}
                    colors={[
                      ["#6366F1", 0.33],
                      ["#10B981", 0.33],
                      ["#F59E0B", 0.34],
                    ]}
                    strokeWidth={12}
                    trailColor="#374151"
                    size={220}
                    onComplete={() => {
                      setShowOverlay(true);
                      setShowSuccess(true);
                      setIsWorkoutStarted(false);
                      setTimerMessage("");
                      playApplauseSound();
                      return [true, 0];
                    }}
                  >
                    {({ remainingTime }) => (
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <div style={{ 
                          fontSize: "2.5rem", 
                          fontWeight: "bold", 
                          color: colors.textPrimary,
                          display: "flex",
                          gap: "4px"
                        }}>
                          <span>{Math.floor(remainingTime / 60)}</span>
                          <span>:</span>
                          <span>{(remainingTime % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div style={{ 
                          fontSize: "0.9rem", 
                          color: colors.textSecondary,
                          marginTop: "8px"
                        }}>
                          {isPaused ? "PAUSED" : "REMAINING"}
                        </div>
                      </div>
                    )}
                  </CountdownCircleTimer>
                )}
                
                {!isWorkoutStarted && !showStartCountdown && (
                  <div style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    border: "2px dashed rgba(255, 255, 255, 0.1)"
                  }}>
                    <Clock size={48} color={colors.textSecondary} />
                    <div style={{ 
                      color: colors.textSecondary, 
                      marginTop: "15px",
                      textAlign: "center",
                      padding: "0 20px"
                    }}>
                      Set your workout duration and press start
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                textAlign: "center", 
                margin: "15px 0",
                minHeight: "24px"
              }}>
                {timerMessage && (
                  <div style={{ 
                    padding: "10px 15px", 
                    background: "rgba(255, 255, 255, 0.05)", 
                    borderRadius: "8px", 
                    color: isPaused ? colors.accent : colors.secondary,
                    display: "inline-block",
                    fontSize: "0.9rem"
                  }}>
                    {timerMessage}
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: "auto" }}>
                {isWorkoutStarted ? (
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "10px"
                  }}>
                    <button
                      onClick={isPaused ? resumeTimer : pauseTimer}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "none",
                        background: isPaused ? colors.secondary : colors.primary,
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = `0 5px 15px ${isPaused ? `${colors.secondary}40` : `${colors.primary}40`}`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {isPaused ? <Play size={18} /> : <Pause size={18} />}
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      onClick={stopWorkout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "none",
                        background: colors.accent,
                        color: colors.dark,
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = `0 5px 15px ${colors.accent}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <StopCircle size={18} />
                      Stop
                    </button>
                    <button
                      onClick={resetWorkout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: colors.textPrimary,
                        cursor: "pointer",
                        fontWeight: "500",
                        gridColumn: "1 / -1",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.05)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      <RotateCcw size={18} />
                      Reset
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label
                        htmlFor="duration"
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: colors.textSecondary,
                          fontSize: "0.9rem"
                        }}
                      >
                        Workout Duration (seconds)
                      </label>
                      <input
                        type="range"
                        id="duration"
                        min="10"
                        max="120"
                        step="5"
                        value={workoutDuration}
                        onChange={handleDurationChange}
                        style={{
                          width: "100%",
                          height: "6px",
                          borderRadius: "3px",
                          background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${(workoutDuration - 10) / 110 * 100}%, rgba(255, 255, 255, 0.1) ${(workoutDuration - 10) / 110 * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                          outline: "none",
                          WebkitAppearance: "none"
                        }}
                      />
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        marginTop: "5px",
                        color: colors.textSecondary,
                        fontSize: "0.8rem"
                      }}>
                        <span>10s</span>
                        <span style={{ fontWeight: "500", color: colors.primary }}>{workoutDuration}s</span>
                        <span>120s</span>
                      </div>
                    </div>
                    <button
                      onClick={startWorkout}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        background: `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)`,
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "1rem",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = `0 5px 15px ${colors.primary}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <Play size={20} fill="#fff" />
                      Start Workout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOverlay && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)"
          }}
          onClick={() => {
            setShowOverlay(false);
            stopApplauseSound();
          }}
        >
          <SuccessAnimation />
          <div style={{
            background: colors.lightDark,
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            position: "relative",
            zIndex: 1001
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.secondary} 0%, #34d399 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "2.5rem"
            }}>
              <Award size={40} color="#fff" />
            </div>
            <h2 style={{ 
              color: colors.textPrimary, 
              marginBottom: "15px",
              fontSize: "1.8rem"
            }}>
              Congratulations!
            </h2>
            <p style={{ 
              color: colors.textSecondary, 
              marginBottom: "25px",
              fontSize: "1.1rem"
            }}>
              You've successfully completed the {work?.name} workout.
            </p>
            <button
              onClick={() => {
                setShowOverlay(false);
                stopApplauseSound();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: colors.primary,
                color: "#fff",
                cursor: "pointer",
                fontWeight: "500",
                margin: "0 auto",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#4f46e5";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.transform = "translateY(0)";
              }}
            >
              <X size={18} />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleWorkout;