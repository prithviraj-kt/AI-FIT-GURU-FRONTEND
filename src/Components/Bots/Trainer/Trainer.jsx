import React, { useState, useEffect, useRef } from "react";
import "./Trainer.css";
import run from "./Aibot";
import Navbar from "../../Navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../../config";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Trainer() {
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
    setValue(localStorage.getItem("email"));
  }, []);

  const handleChange = (e) => setPrompt({ question: e.target.value });

  const handleSubmit = async () => {
    if (!prompt.question.trim()) return;
    setLoading(true);
    setCurrentQuestion(prompt.question);

    try {
      const newUserMessage = { role: "user", parts: [{ text: prompt.question }] };
      const ans = await run([...history, newUserMessage], prompt.question);
      console.log(ans)
      const coachAnswer = ans.msg.response.candidates[0].content.parts[0].text;
      const newModelMessage = { role: "model", parts: [{ text: coachAnswer }] };

      // ✅ Add both user + model messages to history
      setHistory([...history, newUserMessage, newModelMessage]);

      setPrompt({ question: "" });
      setCurrentQuestion("");
    } catch (error) {
      console.error("Error:", error);
      setHistory([
        ...history,
        { role: "model", parts: [{ text: "⚠️ Something went wrong." }] },
      ]);
    }
    setLoading(false);
  };

  const savePlan = async (workoutPlan) => {
    const email = localStorage.getItem("email");
    try {
      await setDoc(doc(db, "workoutplan", email), { workoutPlan });
      toast.success("✅ Workout plan saved!", { autoClose: 2000 });
      setTimeout(() => navigate("/profile"), 2000);
    } catch {
      toast.error("❌ Failed to save plan.");
    }
  };

  // --- Render structured workout plan if JSON ---
  const renderStructuredMessage = (text) => {
    try {
      const json = JSON.parse(text);

      if (json?.workout_plan) {
        return (
          <div className="workout-plan">
            {json.workout_plan.map((dayPlan, idx) => (
              <motion.div
                key={idx}
                className="day-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h6>
                  {dayPlan.day} –{" "}
                  <span className="highlight">
                    {dayPlan.bodyPart?.join(", ")}
                  </span>
                </h6>
                <ul>
                  {dayPlan.workout.map((exercise, i) => (
                    <li key={i}>• {exercise.name}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
            <Button
              variant="success"
              className="mt-3"
              onClick={() => savePlan(json.workout_plan)}
            >
              💾 Save Plan
            </Button>
            <h6 className="mt-3">📌 General Instructions</h6>
            <ul>
              {json.general_instructions?.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        );
      }

      return <div className="message-text">{text}</div>;
    } catch {
      return <div className="message-text">{text}</div>;
    }
  };

  const renderMessage = (message, index) => (
    <motion.div
      key={index}
      className={`message ${message.role}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderStructuredMessage(message.parts[0].text)}
    </motion.div>
  );

  const loadReport = async () => {
    try {
      const email = localStorage.getItem("email");
      const healthDoc = await getDoc(doc(db, "healthdata", email));
      if (healthDoc.exists()) {
        const healthData = healthDoc.data();
        setReport(healthData);
        setModalIsOpen(true);
        setPrompt({ question: JSON.stringify(healthData) });
      } else {
        toast.info("No saved health report found.");
      }
    } catch {
      toast.error("⚠️ Internal error, try again later.");
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  return (
    <div>
      <Navbar />
      <div className="chat-container">
        {value ? (
          <div className="chat-box">
            <h3 className="chat-title neon-text">💪 Arjun – Your Fitness Coach</h3>

            <div className="messages-container">
              {history.map((msg, i) => renderMessage(msg, i))}

              {currentQuestion && (
                <motion.div className="message user">
                  <div className="message-text">{currentQuestion}</div>
                </motion.div>
              )}

              {loading && (
                <div className="typing-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}

              <div ref={messageEndRef}></div>
            </div>

            <div className="input-dock">
              <input
                type="text"
                className="chat-input"
                value={prompt.question}
                onChange={handleChange}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="send-btn glow-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                ➤
              </button>
              <button className="report-btn glow-btn" onClick={loadReport}>
                📊
              </button>
            </div>
          </div>
        ) : (
          <h4 className="login-warning">⚠️ Please log in to continue.</h4>
        )}

        <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>📊 Health Report</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {Object.keys(report).length === 0 ? (
              <div>No data</div>
            ) : (
              Object.keys(report).map((key) => (
                <div key={key} className="report-item">
                  <strong>{key}: </strong> {report[key]}
                </div>
              ))
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setModalIsOpen(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Trainer;
