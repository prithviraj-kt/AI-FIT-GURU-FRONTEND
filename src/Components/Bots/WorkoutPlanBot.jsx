import React, { useState, useEffect } from "react";
import "./WorkoutPlanBot.css";
import run from "../../Aibot";

function WorkoutPlanBot() {
  const [email, setEmail] = useState(""); // Store user email (if applicable)
  const [prompt, setPrompt] = useState({ question: "" }); // User question state
  const [answer, setAnswer] = useState(""); // Coach's answer state
  const [history, setHistory] = useState([]); // Conversation history array

  const data = {
    Gender: "male",
    Height: 181,
    HealthIssues: ["Shoulder pain", "Lower back pain"],
    BodyFat: null,
    WorkoutIntensity: 1,
    FitnessLevel: "Fat with muscle",
    DailyActiveLevel: "Active",
    Weight: 100,
    BMI: 30.52, // Assuming BMI is calculated using weight and height
    WorkoutFrequency: 6,
    SleepDuration: 9.5, // Assuming an average of 9-10 hours
    Goal: "Fat loss",
    Age: 22,
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await localStorage.getItem("email");
      setEmail(data);
    };
    fetchData();
  }, []); // Fetch email data on component mount

  const getDetails = async () => {
    await setPrompt({ question: JSON.stringify(data) });
  };

  const handleChange = (e) => {
    setPrompt({ question: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const ans = await run(prompt.question);
      const coachAnswer =
        ans.result.response.candidates[0].content.parts[0].text;

      console.log(coachAnswer);
      const response = { question: prompt.question, answer: coachAnswer };
      setHistory([...history, response]); // Update history with spread operator
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

  const clickme = () => {
    getDetails();
    handleSubmit();
  };

  return (
    <div className="chatbot-container">
      {email ? (
        <div className="chat-box">
          <button onClick={logout} className="logout-button">
            Logout
          </button>
          <button onClick={clickme}>Load my personal data</button>

          <h1>
            <center>FITNESS INSTRUCTOR</center>
          </h1>

          <div className="message-container">
            {!answer ? (
              <p className="message-text">Pucho ji, kya chahte ho...</p>
            ) : (
              <>
                {answer && history.length > 0 && (
                  <div className="conversation-history">
                    {history.map((item, index) => (
                      <div key={index} className="conversation-item">
                        <p className="you-message">
                          <strong>You:</strong> {item.question}
                        </p>
                        <p className="coach-message">
                          <strong>Coach:</strong> {item.answer}
                        </p>
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
