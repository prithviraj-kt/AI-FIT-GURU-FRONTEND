import React, { useState, useEffect } from "react";
import "./Home.css"; // Import your CSS file

// Assuming you have a separate file (Aibot.js) for handling AI interactions
import run from "../../Aibot";

function WorkoutPlanBot() {
  const [email, setEmail] = useState(""); // Store user email (if applicable)
  const [prompt, setPrompt] = useState({ question: "" }); // User question state
  const [answer, setAnswer] = useState(""); // Coach's answer state
  const [history, setHistory] = useState([]); // Conversation history array

  useEffect(() => {
    const fetchData = async () => {
      const data = await localStorage.getItem("email");
      setEmail(data);
    };
    fetchData();
  }, []); // Fetch email data on component mount

  const handleChange = (e) => {
    setPrompt({ question: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const ans = await run(prompt.question);
      const coachAnswer = JSON.parse(
        ans.msg.response.candidates[0].content.parts[0].text
      );
      console.log(coachAnswer);
      // const response = { Coach: coachAnswer, You: prompt.question };
      // setHistory([...history, response]); // Update history with spread operator
      // setAnswer(coachAnswer);
      setPrompt({ question: "" });
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Something went wrong. Please try again later.");
    }
  };

  const logout = async () => {
    await localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="chatbot-container">
      {email ? (
        <div className="chat-box">
          <button onClick={logout} className="logout-button">
            Logout
          </button>

          <h1>
            <center>FITNESS INSTRUCTOR</center>
          </h1>

          <div className="message-container">
            {!answer ? (
              <p className="message-text">Pucho ji, kya chahte ho...</p>
            ) : (
              <>
                {/* <div className="trainer-message message">
                  <p className="message-text">Loading</p>
                </div> */}

                {answer && history.length > 0 && (
                  <div className="conversation-history">
                    {history.map((item, index) => (
                      <div key={index} className="conversation-item">
                        <p
                          className={
                            item.You
                              ? "you-message bg-warning"
                              : "coach-message"
                          }
                        >
                          {item.You}
                        </p>
                        {item.Coach && (
                          <p className="coach-message bg-danger">
                            {item.Coach}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="input-container">
            <input
              name="question"
              type="text"
              className="user-input"
              onChange={handleChange}
              placeholder="Ask your fitness question..."
              value={prompt.question}
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      ) : (
        // Redirect to login or another component if not logged in
        <div>Please Login</div>
      )}
    </div>
  );
}

export default WorkoutPlanBot;
