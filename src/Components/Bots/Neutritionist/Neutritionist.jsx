import React, { useState, useEffect, useRef } from "react";
import "./Neutritionist.css";
import Navbar from "../../Navbar/Navbar";
import run from "./Aibot";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../config";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
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

  useEffect(() => {
    auth();
  }, []);

  const auth = async () => {
    const data = await localStorage.getItem("email");
    setValue(data);
  };

  const handleChange = (e) => {
    const userInput = e.target.value;
    setPrompt({ question: userInput });

    try {
      JSON.parse(userInput);
    } catch (error) {
      console.error("Input is not in JSON format");
    }
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
      const coachAnswer = ans.msg.response.candidates[0].content.parts[0].text;

      const newModelMessage = {
        role: "model",
        parts: [{ text: coachAnswer }],
      };

      const updatedHistory = [...history, newUserMessage, newModelMessage];

      setHistory(updatedHistory);
      setPrompt({ question: "" });
      setCurrentQuestion("");
    } catch (error) {
      console.error("Error fetching answer:", error);
      const errorMessage = {
        role: "model",
        parts: [{ text: "Something went wrong. Please try again later." }],
      };
      setHistory([...history, errorMessage]);
      setCurrentQuestion("");
    }
    setLoading(false);
  };

  const formatText = (text) => {
    return text;
  };

  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
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

  const QuestionTable = ({ data }) => {
    return (
      <table className="table table-bordered">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  const renderJSONTable = (jsonData) => {
    return (
      <div className="aitrainer-json-table">
        <div>
          {jsonData.modifydietplan ? (
            <div>
              <div className="container">
                <h2 className="text-center mt-4 mb-4">Modify Diet Plan</h2>
                <div className="table-responsive">
                  <table className="table table-dark table-bordered table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Day</th>
                        <th scope="col">Breakfast</th>
                        <th scope="col">Lunch</th>
                        <th scope="col">Evening Snack</th>
                        <th scope="col">Late-Morning Snack</th>
                        <th scope="col">Late night Snack</th>
                        <th scope="col">Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jsonData.modifydietplan.diet.map((dayPlan, index) => (
                        <tr key={index}>
                          <td>{dayPlan.day}</td>
                          <td>{dayPlan.meals?.['1. Breakfast'] || "-"}</td>
                          <td>{dayPlan.meals?.['3. Lunch'] || "-"}</td>
                          <td>{dayPlan.meals?.['4. Evening Snack'] || "-"}</td>
                          <td>{dayPlan.meals?.['2. Late-Morning Snack'] || "-"}</td>
                          <td>{dayPlan.meals?.['6. Late night Snack'] || "-"}</td>
                          <td>{dayPlan.meals?.['5. Dinner'] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="container">
              <h2 className="text-center mt-4 mb-4">My Health Report</h2>
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Key</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(jsonData).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const navigate = useNavigate();

  const savePlan = async (diet) => {
    const email = await localStorage.getItem("email");
    try {
      await setDoc(doc(db, "dietPlan", email), { diet });
      toast.success("Diet plan saved successfully!", {
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
      console.error("Error saving Diet plan:", error);
      toast.error("Failed to save Diet plan. Please try again.", {
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
        if (jsonData.diet && jsonData.other_instructions) {
          return (
            <div>
              {jsonData.diet.length > 0 &&
                jsonData.diet.map((dayPlan, index) => (
                  <div key={index} className="aitrainer-day-plan">
                    <h5 className="text-warning">{dayPlan.day}</h5>
                    <ul>
                      {Object.entries(dayPlan.meals).map(
                        ([mealTime, meal], i) => (
                          <li key={i}>
                            <strong>{mealTime}:</strong> {meal}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              {jsonData.diet.length > 0 && (
                <div>
                  <Button
                    variant="primary"
                    onClick={() => savePlan(jsonData.diet)}
                  >
                    Save this Diet Plan?
                  </Button>{" "}
                </div>
              )}
              <h4>General Talk</h4>
              <ul>
                {jsonData.other_instructions.map((instruction, index) => (
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

  const [explore, setExplore] = useState(false);
  const [modifyDietPlan, setModifyDietPlan] = useState(false);
  const [existingDietPlan, setExistingDietPlan] = useState([]);
  const getDietPlan = async () => {
    setModifyDietPlan(true);
    try {
      const existingDietPlan = await getDoc(doc(db, "dietPlan", value));
      if (existingDietPlan.exists()) {
        const diets = existingDietPlan.data();
        const modifiedDiets = {
          modifydietplan: diets,
        }; // Create a new object with the desired key

        setExistingDietPlan(diets);
        // Set the prompt to modify the existing workout plan
        setPrompt({
          question: JSON.stringify(modifiedDiets),
        });
        handleSubmit();
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
  return (
    <div>
      <Navbar />
      <div className="aitrainer-container">
        {value ? (
          <div className="aitrainer-chat-box">
            <h4>
              <center>PERSONAL NUTRITIONIST: DR. HANUMAN</center>
            </h4>
            <div className="aitrainer-message-container">
              <div className="aitrainer-model-message aitrainer-message">
                <p className="aitrainer-message-text">
                  Hello! 👋 It's great to hear from you. I'm Dr. Hanuman, your
                  expert dietician and nutritionist at Lets Workout. Tell me,
                  what brings you in today? What are your goals for your diet
                  and nutrition? Are you looking to lose weight, gain muscle,
                  manage a specific condition, or simply improve your overall
                  health? The more information you give me, the better I can
                  tailor a plan that's perfect for you!
                </p>
                <div className="row">
                  <Row className=" d-flex justify-content-center">
                    {/* <Col xs="auto"> */}
                    <Button
                      className="w-25 m-3"
                      onClick={() => getDietPlan()}
                      variant="primary"
                    >
                      Modify Diet Plan
                    </Button>
                    {/* </Col> */}
                    {/* <Col xs="auto"> */}
                    <Button
                      onClick={() => letsExploreButton()}
                      className="w-25 m-3"
                      variant="secondary"
                    >
                      Create Diet Plan
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
              {explore && (
                <div className="aitrainer-model-message aitrainer-message">
                  <p className="aitrainer-message-text">
                    Hello! 👋 dear. How can I help you today?
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
                    {message.role === "user" && isJson(message.parts[0].text)
                      ? renderJSONTable(JSON.parse(message.parts[0].text))
                      : renderMessageContent(message.parts[0].text)}
                  </p>
                </div>
              ))}
              {/* {
                JSON.stringify(existingDietPlan)
              } */}
              {currentQuestion && (
                <div className="aitrainer-user-message aitrainer-message">
                  <p className="aitrainer-message-text">
                    {isJson(currentQuestion)
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
            {(modifyDietPlan || explore) && (
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
          "You need to login first."
        )}
      </div>
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
  );
}

export default Home;
