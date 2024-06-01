import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function QuickWorkout() {
  useEffect(() => {
    getWorkout();
  }, []);

  const target = [
    "abs",
    "quads",
    "lats",
    "calves",
    "pectorals",
    "glutes",
    "hamstrings",
    "adductors",
    "triceps",
    "cardiovascular system",
    "spice",
    "upper back",
    "biceps",
    "delts",
    "forearms",
    "traps",
    "serratus anterior",
  ];

  const [workout, setWorkout] = useState([]);
  const [bodyPart, setBodyPart] = useState([]);
  const { purpose } = useParams();

  const getWorkout = async () => {
    const myWorkout = await localStorage.getItem("workout");
    const parsedWorkout = JSON.parse(myWorkout);

    if (parsedWorkout) {
      setWorkout(parsedWorkout);

      // Extract values of the key corresponding to `purpose`
      const purposeValues = parsedWorkout
        .filter((item) => item[purpose])
        .map((item) => item[purpose]);

      // Flatten the array if it contains nested arrays and remove duplicates
      const uniqueBodyParts = [...new Set(purposeValues.flat())];

      setBodyPart(uniqueBodyParts);
    }
  };

  const handleClick = () => {
    console.log(bodyPart);
  };

  const [fil, setFil] = useState("");
  const filterChange = (e) => {
    setFil(e.target.value);
  };

  // Filter workouts based on the selected body part
  const filteredWorkouts = workout.filter((item) => {
    if (!fil) return true;
    return item[purpose] && item[purpose].includes(fil);
  });

  return (
    <div className="container-fluid my-4">
      <div className="row mb-4">
        <div className="col text-center">
          <h1>{purpose.toUpperCase()}</h1>
          <button className="btn btn-primary mt-3" onClick={handleClick}>
            Click me
          </button>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <select
            onChange={filterChange}
            className="form-select"
            aria-label="Default select example"
            value={fil}
          >
            <option value="">Open this select menu</option>
            {bodyPart.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        {filteredWorkouts.map((item, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>ID:</strong> {item.id}
                </div>
                <h5 className="card-title mb-0">{item.name}</h5>
              </div>
              {item.gifUrl && (
                <img
                  src={item.gifUrl}
                  className="card-img-top"
                  alt={item.name}
                />
              )}
              <div className="card-body">
                <p className="card-text">
                  <strong>Target:</strong> {item.target}
                </p>
                <p className="card-text">
                  <strong>Target:</strong> {item.equipment}
                </p>
                <p className="card-text">
                  <strong>Description:</strong> {item.instructions}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickWorkout;
