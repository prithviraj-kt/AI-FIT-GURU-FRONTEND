import React, { useState, useEffect, useRef } from "react";
import App from "./App";
import "./Home.css";
import run from "./Aibot";

function Home() {
  const [value, setValue] = useState("");

  useEffect(() => {
    auth();
  }, []);

  const auth = async () => {
    const data = await localStorage.getItem("email");
    console.log(data);
    setValue(data);
  };

  const [prompt, setPrompt] = useState({ question: "" });
  const handleChange = (e) => {
    setPrompt({ question: e.target.value });
    console.log(prompt.question);
  };

  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    setAnswer("Thamba Thamba..... aapka jawab aara hai")
    const answer = await run(prompt.question);
    setAnswer(answer);
  };

  const logout = async () => {
    await localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="chatbot-container">
      {value ? (
        <div className="chat-box">
          <button onClick={logout} className="logout-button">
            Logout
          </button>

          <h1>
            {" "}
            <center>FITNESS INSTRUCTOR</center>
          </h1>
          <div className="message-container">
            {!answer ? (
              <p className="message-text">Pucho ji, kya chahte ho...</p>
            ) : (
              <div className="trainer-message message">
                <p className="message-text">{answer}</p>
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              name="question"
              type="text"
              className="user-input"
              onChange={handleChange}
              placeholder="Ask your fitness question..."
            //   value={prompt.question}
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      ) : (
        <App />
      )}
    </div>
  );
}

export default Home;
