import React, { useState, useEffect, useRef } from "react";
import "./Trainer.css";
import run from "./Aibot";
import Navbar from "../../Navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { storage, db } from "../../../config";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Home() {
  const [value, setValue] = useState("");
  const [prompt, setPrompt] = useState({ question: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    auth();
  }, []);

  const auth = async () => {
    const data = await localStorage.getItem("email");
    console.log(data);
    setValue(data);
  };

  const handleChange = (e) => {
    setPrompt({ question: e.target.value });
  };

  const handleSubmit = async () => {
    if (!prompt.question.trim()) {
      return;
    }

    setLoading(true);
    setCurrentQuestion(prompt.question);

    try {
      const newUserMessage = {
        role: "user",
        parts: [{ text: prompt.question }],
      };

      const newHistory = [...history, newUserMessage];

      const ans = await run(newHistory, prompt.question);
      const coachAnswer = JSON.parse(
        ans.msg.response.candidates[0].content.parts[0].text
      );

      const newModelMessage = {
        role: "model",
        parts: [{ text: JSON.stringify(coachAnswer) }],
      };
      const updatedHistory = [...history, newUserMessage, newModelMessage];
      console.log(JSON.stringify(updatedHistory));

      setHistory(updatedHistory);
      setPrompt({ question: "" });
      setCurrentQuestion("");
    } catch (error) {
      console.error("Error fetching answer:", error);
      const errorMessage = {
        role: "model",
        parts: [
          { text: "Problem occured from our side. Please try again later." },
        ],
      };
      setHistory([...history, errorMessage]);
      setCurrentQuestion("");
    }

    setLoading(false);
  };

  const savePlan = async (workoutPlan) => {
    const email = await localStorage.getItem("email");
    try {
      await setDoc(doc(db, "workoutplan", email), { workoutPlan });
      toast.success("Workout plan saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => navigate("/profile"), 3000);
    } catch (error) {
      console.error("Error saving workout plan:", error);
      toast.error("Failed to save workout plan. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const renderMessageContent = (text) => {
    try {
      const jsonData = JSON.parse(text);
      if (typeof jsonData === "object" && jsonData !== null) {
        if (jsonData.workout_plan) {
          return (
            <div>
              {/* <h1>Workout Plan</h1> */}
              {jsonData.workout_plan.map((dayPlan, index) => (
                <div key={index} className="aitrainer-day-plan">
                  <h5 className="text-warning">
                    {dayPlan.day.charAt(0).toUpperCase() + dayPlan.day.slice(1)}
                    : {dayPlan.bodyPart.join(", ")}
                  </h5>
                  <ul>
                    {dayPlan.workout.map((exercise, i) => (
                      <li key={i}>{exercise.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {jsonData.workout_plan.length > 0 && (
                <Button
                  variant="primary"
                  onClick={() => savePlan(jsonData.workout_plan)}
                >
                  Save this workout Plan?
                </Button>
              )}
              <h4>General Instructions</h4>
              <ul>
                {jsonData.general_instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          );
        }
      }
    } catch (e) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
  };

  const renderJSONTable = (jsonData) => {
    return (
      <table className="aitrainer-json-table">
        <tbody>
          {Object.entries(jsonData).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{JSON.stringify(value, null, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const isJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, loading]);

  const loadReport = async () => {
    const email = await localStorage.getItem("email");
    try {
      const healthDoc = await getDoc(doc(db, "healthdata", email));
      if (healthDoc.exists()) {
        const healthData = healthDoc.data();
        setReport(healthData);
        setModalIsOpen(true);
        setPrompt({ question: JSON.stringify(healthData) });
        handleSubmit(); // Send the health data to the AI model
      }
    } catch (error) {
      toast.error("Internal error occurred. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const [explore, setExplore] = useState(false);
  const [modifyWorkoutPlan, setModifyWorkoutPlan] = useState(false);
  const [existingWorkoutPlan, setExistingWorkoutPlan] = useState([]);
  const getWorkoutPlan = async () => {
    setModifyWorkoutPlan(true);
    try {
      const existingWorkoutPlan = await getDoc(doc(db, "workoutplan", value));
      if (existingWorkoutPlan.exists()) {
        const workouts = existingWorkoutPlan.data();
        const modifiedWorkouts = {
          "modify this workout plan": workouts.workoutPlan,
        }; // Create a new object with the desired key

        setExistingWorkoutPlan(workouts);
        // Set the prompt to modify the existing workout plan
        setPrompt({
          question: JSON.stringify(modifiedWorkouts),
        });
        handleSubmit(); // Send the prompt to the AI model
        console.log(modifiedWorkouts); // Logging the new object with the modified key
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("error: " + error);
    }
  };

  const letsExploreButton = () => {
    setExplore(true);
  };

  // const getModifiedWorkoutPlan = async () => {
  //   const existingWorkoutPlan = await getDoc(doc(db, "workoutplan", value));
  //   if (existingWorkoutPlan.length > 1) {
  //     setExistingWorkoutPlan(existingWorkoutPlan);
  //     alert("Fetched wrokout plan");
  //   }
  // };
  // getModifiedWorkoutPlan();

  

  return (
    <div>
      <Navbar />
      <div className="aitrainer-container">
        {value ? (
          <div className="aitrainer-chat-box">
            <h4>
              <center>FITNESS COACH: SHIVA</center>
            </h4>
            <div className="aitrainer-message-container">
              <div className="aitrainer-model-message aitrainer-message">
                <p className="aitrainer-message-text">
                  Namaste! I am Shiva, your personal strength and wellness
                  coach. Tell me, what brings you to Let's Workout? To best
                  guide your training, please tell me what you'd like to focus
                  on this week. Would you like a balanced workout routine
                  targeting all muscle groups or something specific? 💪 Let's
                  create a routine that will make you feel your best! 😄
                </p>
                <div className="row">
                  <Row className=" d-flex justify-content-center">
                    {/* <Col xs="auto"> */}
                    <Button
                      className="w-25 m-3"
                      onClick={() => getWorkoutPlan()}
                      variant="primary"
                    >
                      Modify Workout Plan
                    </Button>
                    {/* </Col> */}
                    {/* <Col xs="auto"> */}
                    <Button onClick={()=>setExplore(true)} className="w-25 m-3" variant="secondary">
                      Create Workout Plan
                    </Button>
                    {/* </Col> */}
                    {/* <Col xs="auto"> */}
                    <Button
                      className="w-25 m-3"
                      onClick={() => letsExploreButton()}
                      variant="success"
                    >
                      Just Explore
                    </Button>
                    {/* </Col> */}
                  </Row>
                </div>
              </div>
              {modifyWorkoutPlan && (
                <div className="aitrainer-model-message aitrainer-message">
                  <p className="aitrainer-message-text">
                    Workout loaded successfully💪 click on chat to chat with
                    model
                  </p>
                </div>
              )}

              {explore && (
                <div className="aitrainer-model-message aitrainer-message">
                  <p className="aitrainer-message-text">
                    Let me know how can I help you dear 😄
                  </p>
                </div>
              )}

              {history.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === "user"
                      ? "aitrainer-user-message"
                      : "aitrainer-model-message"
                  } aitrainer-message`}
                >
                  <p className="aitrainer-message-text">
                    {message.role === "user" && isJSON(message.parts[0].text)
                      ? renderJSONTable(JSON.parse(message.parts[0].text))
                      : renderMessageContent(message.parts[0].text)}
                  </p>
                </div>
              ))}
              {currentQuestion && (
                <div className="aitrainer-user-message aitrainer-message">
                  <p className="aitrainer-message-text">
                    {isJSON(currentQuestion)
                      ? renderJSONTable(JSON.parse(currentQuestion))
                      : renderMessageContent(currentQuestion)}
                  </p>
                </div>
              )}
              {loading && (
                <div className="aitrainer-model-message aitrainer-message loading-animation">
                  <div className="loading-balls">
                    <div
                      className="ball"
                      style={{ backgroundColor: "#e74c3c" }}
                    ></div>
                    <div
                      className="ball"
                      style={{ backgroundColor: "#f39c12" }}
                    ></div>
                    <div
                      className="ball"
                      style={{ backgroundColor: "#f1c40f" }}
                    ></div>
                    <div
                      className="ball"
                      style={{ backgroundColor: "#2ecc71" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messageEndRef}></div>
            </div>
            {/* {explore && (
              <div className="aitrainer-input-container">
                <input
                  type="text"
                  className="aitrainer-user-input"
                  value={prompt.question}
                  onChange={handleChange}
                  placeholder="Type your question here..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
                <button
                  className="aitrainer-submit-button m-1"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Chat"}
                </button>

                <button
                  className="aitrainer-submit-button m-1"
                  onClick={loadReport}
                  disabled={loading}
                >
                  Load report
                </button>
              </div>
            )} */}

            {(modifyWorkoutPlan || explore) && (
              <div className="aitrainer-input-container">
                <input
                  type="text"
                  className="aitrainer-user-input"
                  value={prompt.question}
                  onChange={handleChange}
                  placeholder="Type your question here..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
                <button
                  className="aitrainer-submit-button m-1"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Chat"}
                </button>

                <button
                  className="aitrainer-submit-button m-1"
                  onClick={loadReport}
                  disabled={loading}
                >
                  Load report
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="aitrainer-login-box">
            <h4>Welcome to the Fitness Trainer App!</h4>
            <p>Please log in to start your session.</p>
            {/* Add your login form or component here */}
          </div>
        )}
        <Modal
          show={modalIsOpen}
          onHide={() => setModalIsOpen(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Report Data</Modal.Title>
          </Modal.Header>
          <div className="row">
            <p className="text-warning mx-3">
              Please visit profile page to change your health data
            </p>
          </div>
          <Modal.Body>
            {Object.keys(report).map((key) => (
              <div key={key} className="report-item">
                <strong>{key}:</strong> {report[key]}
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Home;
