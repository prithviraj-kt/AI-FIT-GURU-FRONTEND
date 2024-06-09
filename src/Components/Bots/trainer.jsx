import React, { useState, useEffect, useRef } from "react";
import "./trainer.css";
import run from "./Aibot";
import Navbar from "../Navbar/Navbar";

function Home() {
  const [value, setValue] = useState("");
  const [prompt, setPrompt] = useState({ question: "" });
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

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
    setAnswer("Thamba Thamba..... aapka jawab aara hai");

    try {
      const newUserMessage = {
        role: "user",
        parts: [{ text: prompt.question.toUpperCase() }],
      };

      // Add user message to the history
      const newHistory = [...history, newUserMessage];

      // Get the coach's answer
      const ans = await run(newHistory, prompt.question);
      const coachAnswer = ans.msg.response.candidates[0].content.parts[0].text;

      const newModelMessage = {
        role: "model",
        parts: [{ text: coachAnswer.toUpperCase() }],
      };

      // Update the history with both user and model messages
      const updatedHistory = [...newHistory, newModelMessage];

      setHistory(updatedHistory);
      setAnswer(coachAnswer);
      setPrompt({ question: "" });
      console.log(updatedHistory);
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  const formatText = (text) => {
    const parts = text.split(/(\*{1,2}[^*]+\*{1,2})/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <div key={index} style={{ display: "block" }}>
            {part.slice(1, -1)}
          </div>
        );
      }
      return part;
    });
    return parts;
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    if (loading && messageEndRef.current) {
      const timeoutId = setTimeout(() => {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 2000); // Adjust duration as needed
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Filter out duplicates by using only even indices
  const filteredHistory = history.filter((_, index) => index % 2 === 0);

  return (
    <div>
      <Navbar />
      <div className="aitrainer-container">
        {value ? (
          <div className="aitrainer-chat-box">
            <h1>
              <center>PERSONAL TRAINER</center>
            </h1>
            <div className="aitrainer-message-container">
              {filteredHistory.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === "user"
                      ? "aitrainer-user-message"
                      : "aitrainer-model-message"
                  } aitrainer-message`}
                >
                  <p className="aitrainer-message-text">
                    {formatText(message.parts[0].text)}
                  </p>
                </div>
              ))}
              {loading && (
                <div className="aitrainer-model-message aitrainer-message typing">
                  <p className="aitrainer-message-text">...</p>
                </div>
              )}
              <div ref={messageEndRef}></div>
            </div>
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
                className="aitrainer-submit-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "Send"}
              </button>
            </div>
          </div>
        ) : (
          "You need to login first."
        )}
      </div>
    </div>
  );
}

export default Home;
