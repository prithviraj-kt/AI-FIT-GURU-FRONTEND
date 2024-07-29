import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuickWorkout.css"; // Create and import a CSS file for custom styles

function QuickWorkout() {
  useEffect(() => {
    auth();
    getWorkout();
  }, []);

  const auth = () => {
    const auth = localStorage.getItem("email");
    if (!auth) {
      navigate("/");
    }
  };

  const [workout, setWorkout] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const { purpose } = useParams();
  const navigate = useNavigate();

  const getWorkout = async () => {
    const myWorkout = await localStorage.getItem("workout");
    const parsedWorkout = JSON.parse(myWorkout);
    // console.log(parsedWorkout);

    if (parsedWorkout) {
      setWorkout(parsedWorkout);

      // Extract values of the key corresponding to `purpose`
      const purposeValues = parsedWorkout
        .filter((item) => item[purpose] && item[purpose] !== "cardio")
        .map((item) => item[purpose]);

      // Flatten the array if it contains nested arrays and remove duplicates
      const uniqueBodyParts = [...new Set(purposeValues.flat())];

      setBodyParts(uniqueBodyParts);
    }
  };

  const handleBodyPartChange = (e) => {
    const selectedBodyPart = e.target.value;
    setSelectedBodyPart(selectedBodyPart);

    // Extract unique targets for the selected body part
    const filteredTargets = workout
      .filter((item) => item.bodyPart === selectedBodyPart)
      .map((item) => item.target);

    const uniqueTargets = [...new Set(filteredTargets.flat())];
    setTargets(uniqueTargets);
    setSelectedTarget(""); // Reset target selection when body part changes
  };

  const handleTargetChange = (e) => {
    setSelectedTarget(e.target.value);
  };

  // Filter workouts based on the selected body part and target
  const filteredWorkouts = workout.filter((item) => {
    console.log(workout);
    if (purpose === "cardio") {
      return item.bodyPart.includes("cardio");
    }
    if (!selectedBodyPart) {
      return true; // Display all workouts if no body part is selected
    }
    if (purpose === "bodyPart") {
      if (selectedTarget) {
        return (
          item.bodyPart === selectedBodyPart && item.target === selectedTarget
        );
      }
      return item.bodyPart === selectedBodyPart;
    } else {
      return item[purpose] === selectedBodyPart;
    }
  });

  const navigateToWorkout = (workoutName) => {
    navigate(`/${encodeURIComponent(workoutName)}`);
  };

  const pageTitle = purpose === "calisthenics" ? "Calisthenics" : purpose;

  return (
    <div className="container-fluid my-4">
      <div className="row mb-4">
        <div className="col text-center">
          <h1>{pageTitle.toUpperCase()}</h1>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          {purpose != "calisthenics" && purpose != "cardio" ? (
            <div>
              <select
                onChange={handleBodyPartChange}
                className="form-select"
                aria-label="Default select example"
                value={selectedBodyPart}
              >
                <option value="">Select Body Part</option>
                {bodyParts.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
      {purpose === "bodyPart" && selectedBodyPart && (
        <div className="row mb-4">
          <div className="col-md-6 offset-md-3">
            <select
              onChange={handleTargetChange}
              className="form-select"
              aria-label="Default select example"
              value={selectedTarget}
            >
              <option value="">Select Target</option>
              {targets.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="row">
        {filteredWorkouts.map((item, index) => (
          <div
            key={index}
            className="col-md-4 mb-4"
            onClick={() => navigateToWorkout(item.name)}
          >
            <div className="card h-100 shadow-sm quick-workout-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>ID:</strong> {item.id}
                </div>
                <h5 className="card-title mb-0">{item.name}</h5>
              </div>
              <div className="quick-workout-image-container">
                {item.gifUrl && (
                  <img
                    src={item.gifUrl}
                    className="card-img-top quick-workout-image"
                    alt={item.name}
                  />
                )}
                <div className="quick-workout-description-overlay">
                  <p className="quick-workout-description">
                    <strong>Description:</strong> {item.instructions}
                  </p>
                </div>
              </div>
              <div className="card-body">
                <p className="card-text">
                  <strong>Target:</strong> {item.target}
                </p>
              </div>
              <button
                className="btn btn-primary mt-3"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card's onClick event
                  navigateToWorkout(item.name);
                }}
              >
                Let's start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickWorkout;
