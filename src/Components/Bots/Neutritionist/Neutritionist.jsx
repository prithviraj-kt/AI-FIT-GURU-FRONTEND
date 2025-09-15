import React, { useState, useEffect, useRef } from "react";
import "./Neutritionist.css";
import Navbar from "../../Navbar/Navbar";
import run from "./Aibot";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../config";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    setValue(localStorage.getItem("email"));
  }, []);

  const handleChange = (e) => setPrompt({ question: e.target.value });

  const handleSubmit = async () => {
    if (!prompt.question.trim()) return;
    setLoading(true);
    setCurrentQuestion(prompt.question);

    try {
      const newUserMessage = { role: "user", parts: [{ text: prompt.question }] };
      const newHistory = [...history, newUserMessage];

      const ans = await run(newHistory, prompt.question);
      const coachAnswer = ans.msg.response.candidates[0].content.parts[0].text;

      const newModelMessage = { role: "model", parts: [{ text: coachAnswer }] };

      setHistory([...history, newUserMessage, newModelMessage]);
      setPrompt({ question: "" });
      setCurrentQuestion("");
    } catch (error) {
      console.error(error);
      setHistory([
        ...history,
        { role: "model", parts: [{ text: "⚠️ Something went wrong." }] },
      ]);
    }
    setLoading(false);
  };

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
      toast.error("Internal error. Try again later.");
    }
  };

  const savePlan = async (plan) => {
    try {
      const email = localStorage.getItem("email");
      await setDoc(doc(db, "plans", email), { plan }, { merge: true });
      toast.success("✅ Plan saved to profile!");
    } catch {
      toast.error("❌ Failed to save plan.");
    }
  };

  // --- Render JSON as cards if possible ---
  const prettifyLabel = (key) => {
    // convert snake_case or camelCase to Title Case for labels
    return key
      .replace(/_/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const isHealthReportShape = (json) => {
    // heuristic: presence of keys typical to health report
    const keys = new Set(Object.keys(json).map((k) => k.toLowerCase()));
    const indicators = [
      "bmi",
      "body_fat",
      "bodyfat",
      "weight",
      "height",
      "calorie",
      "fitness",
      "goal",
      "age",
    ];
    return indicators.some((ind) => keys.has(ind) || [...keys].some(k => k.includes(ind)));
  };

  const renderStructuredMessage = (text) => {
    try {
      const json = JSON.parse(text);

      // If this is a diet plan (existing behavior)
      if (json && typeof json === "object" && json.diet) {
        return (
          <div className="diet-plan">
            {json.diet.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="day-card"
              >
                <h5>{day.day}</h5>
                <ul>
                  {Object.entries(day.meals).map(([meal, desc], i) => (
                    <li key={i}>
                      <strong>{meal}</strong>: {desc}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            {json.other_instructions && (
              <div className="instructions">
                {/* <h6>Other Instructions</h6> */}
                <ul>
                  {json.other_instructions.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {json.diet.length>2 && (
              <Button variant="success" className="mt-2" onClick={() => savePlan(json)}>
                💾 Save Plan
              </Button>
            )}
          </div>
        );
      }

      // If this looks like a health report, render a polished view
      if (json && typeof json === "object" && isHealthReportShape(json)) {
        const primaryMetrics = [
          { key: "weight", label: "Weight", unit: "kg" },
          { key: "height", label: "Height", unit: "cm" },
          { key: "BMI", label: "BMI" },
          { key: "Body_Fat", label: "Body Fat" },
          { key: "Suggested_Calorie_Intake", label: "Suggested Calorie Intake" },
          { key: "Maintenance_Calories", label: "Maintenance Calories" },
        ];

        // Build pairs from existing json keys (case-insensitive)
        const normalized = {};
        for (const k of Object.keys(json)) {
          normalized[k.toLowerCase()] = { key: k, value: json[k] };
        }

        return (
          <div className="health-report">
            <div className="health-header">
              <div>
                <p>Health Report uploaded</p>
                {/* <p className="muted bg-danger">Personal summary and recommended targets</p> */}
              </div>
             
            </div>

            <div className="kv-grid">
              {/* Highlight primary metrics first */}
              {primaryMetrics.map((m) => {
                const found = Object.keys(normalized).find((k) =>
                  k.includes(m.key.toLowerCase())
                );
                if (!found) return null;
                const rawKey = normalized[found].key;
                const val = normalized[found].value;
                return (
                  <div key={rawKey} className="stat-card">
                    <div className="stat-value">{val}</div>
                    <div className="stat-label">{m.label}</div>
                  </div>
                );
              })}

              {/* Then render the rest of fields */}
              {Object.keys(json).map((k) => {
                const lower = k.toLowerCase();
                // skip those already shown as primary
                if (
                  primaryMetrics.some((m) => lower.includes((m.key + "").toLowerCase()))
                ) {
                  return null;
                }
                return (
                  <div key={k} className="kv-item">
                    <div className="kv-key">{prettifyLabel(k)}</div>
                    <div className="kv-val">{json[k]}</div>
                  </div>
                );
              })}
            </div>

            {/* Optional: full JSON toggle */}
            <details className="json-details">
              <summary>View raw report</summary>
              <pre className="json-block">{JSON.stringify(json, null, 2)}</pre>
            </details>
          </div>
        );
      }

      // default: pretty print any other JSON
      return <pre className="json-block">{JSON.stringify(json, null, 2)}</pre>;
    } catch {
      // not JSON -> plain text
      return <div className="message-text">{text}</div>;
    }
  };

  const renderMessage = (message, index) => (
    <motion.div
      key={index}
      className={`message ${message.role}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {renderStructuredMessage(message.parts[0].text)}
    </motion.div>
  );

  return (
    <div>
      <Navbar />
      <div className="chat-container">
        {value ? (
          <div className="chat-box">
            <h3 className="chat-title neon-text">👩‍⚕️ Teena – Your AI Nutritionist</h3>

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
              <button className="send-btn glow-btn" onClick={handleSubmit} disabled={loading}>
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
      </div>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Health Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(report).length === 0 ? (
            <div>No data</div>
          ) : (
            Object.keys(report).map((key) => (
              <div key={key} className="report-item">
                <strong>{prettifyLabel(key)}: </strong> {report[key]}
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
  );
}

export default Home;
