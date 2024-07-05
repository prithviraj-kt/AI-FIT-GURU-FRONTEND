import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import Navbar from "../Navbar/Navbar";
import { db } from "../../config";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const [workouts, setWorkout] = useState([]);
  const [quickAccess, setQuickAccess] = useState("all");
  const [equipments, setEquipments] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [targets, setTargets] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [yogaCategories, setYogaCategories] = useState([]);
  const [yogaData, setYogaData] = useState([]);
  const [selectedYogaCategory, setSelectedYogaCategory] = useState(null);

  useEffect(() => {
    auth();
    getWorkout();
    fetchYogaData(); // Fetch yoga data on component mount
  }, []);

  const auth = () => {
    const auth = localStorage.getItem("email");
    if (!auth) {
      navigate("/login");
    }
  };

  const getWorkout = async () => {
    try {
      const getWorkouts = await localStorage.getItem("workout");
      if (!getWorkouts || getWorkouts.length < 100) {
        const workoutsCollection = collection(db, "workouts");
        const querySnapshot = await getDocs(workoutsCollection);
        const workoutData = [];
        const equipmentSet = new Set();
        const bodyPartSet = new Set();

        querySnapshot.forEach((doc) => {
          const data = { ...doc.data(), id: doc.id };
          workoutData.push(data);
          if (data.equipment) {
            equipmentSet.add(data.equipment);
          }
          if (data.bodyPart) {
            bodyPartSet.add(data.bodyPart);
          }
        });

        setWorkout(workoutData);
        setFilteredWorkouts(workoutData);
        setEquipments([...equipmentSet]);
        setBodyParts([...bodyPartSet]);
        await localStorage.setItem("workout", JSON.stringify(workoutData));
      } else {
        const workoutData = JSON.parse(getWorkouts);
        setWorkout(workoutData);
        setFilteredWorkouts(workoutData);
        const equipmentSet = new Set();
        const bodyPartSet = new Set();

        workoutData.forEach((data) => {
          if (data.equipment) {
            equipmentSet.add(data.equipment);
          }
          if (data.bodyPart) {
            bodyPartSet.add(data.bodyPart);
          }
        });

        setEquipments([...equipmentSet]);
        setBodyParts([...bodyPartSet]);
      }
    } catch (error) {
      alert("Error occurred... Please try to load again later");
    }
  };

  const fetchYogaData = async () => {
    try {
      const response = await axios.get(
        "https://yoga-api-nzy4.onrender.com/v1/categories"
      );
      setYogaCategories(response.data);
    } catch (error) {
      console.error("Error fetching yoga data:", error);
    }
  };

  const handleQuickAccess = (purpose) => {
    setSelectedItem(null);
    setTargets([]);
    setSelectedType(purpose);
    setSelectedTarget(null);
    setSelectedYogaCategory(null); // Reset selected category
    if (purpose === "yoga") {
      setQuickAccess("yoga");
    } else if (purpose === "calisthenics") {
      const filtered = workouts.filter(
        (workout) => workout.equipment === "body weight"
      );
      setFilteredWorkouts(filtered);
      setQuickAccess("filtered");
    } else if (purpose === "cardio") {
      const filtered = workouts.filter(
        (workout) => workout.bodyPart === "cardio"
      );
      setFilteredWorkouts(filtered);
      setQuickAccess("filtered");
    } else if (purpose === "all") {
      setFilteredWorkouts(workouts);
      setQuickAccess("filtered");
    } else {
      setQuickAccess(purpose);
    }
  };

  const handleYogaCategoryClick = async (category) => {
    console.log(category);
    setSelectedYogaCategory(category);
    // try {
    //   const response = await axios.get(
    //     `https://yoga-api-nzy4.onrender.com/v1/categories/${category.id}/poses`
    //   );
      setYogaData(category.poses);
    // } catch (error) {
    //   console.error("Error fetching yoga poses:", error);
    // }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedTarget(null);

    if (selectedType === "equipment") {
      const filtered = workouts.filter((workout) => workout.equipment === item);
      setFilteredWorkouts(filtered);
      setQuickAccess("filtered");
    } else if (selectedType === "bodyPart") {
      const filtered = workouts.filter((workout) => workout.bodyPart === item);
      const targetSet = new Set();
      filtered.forEach((data) => {
        if (data.target) {
          targetSet.add(data.target);
        }
      });
      setTargets([...targetSet]);
      setFilteredWorkouts(filtered);
    }
  };

  const handleTargetClick = (target) => {
    const filtered = workouts.filter((workout) => workout.target === target);
    setFilteredWorkouts(filtered);
    setSelectedTarget(target);
    setQuickAccess("filtered");
  };

  const renderMainButtons = () => (
    <div className="home-quick-access-container">
      {["all", "equipment", "bodyPart", "calisthenics", "yoga"].map(
        (item, index) => (
          <div key={index} className="home-quick-access-item">
            <button
              onClick={() => handleQuickAccess(item)}
              className={`home-btn-primary ${
                selectedType === item ? "home-btn-selected" : ""
              }`}
            >
              {item.toUpperCase()}
            </button>
          </div>
        )
      )}
    </div>
  );

  const renderEquipmentButtons = () => (
    <div className="home-quick-access-container">
      <div className="home-horizontal-scroll">
        {equipments.map((item, index) => (
          <div key={index} className="home-quick-access-item m-1">
            <button
              onClick={() => handleItemClick(item)}
              className={`home-btn-primary ${
                selectedItem === item ? "home-btn-selected" : ""
              }`}
            >
              {item}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBodyPartButtons = () => (
    <div className="home-quick-access-container">
      <div className="home-horizontal-scroll">
        {bodyParts.map((item, index) => (
          <div key={index} className="home-quick-access-item m-1">
            <button
              onClick={() => handleItemClick(item)}
              className={`home-btn-primary ${
                selectedItem === item ? "home-btn-selected" : ""
              }`}
            >
              {item}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTargetButtons = () => (
    <div className="home-quick-access-container">
      <div className="home-horizontal-scroll">
        {targets.map((item, index) => (
          <div key={index} className="home-quick-access-item m-1">
            <button
              onClick={() => handleTargetClick(item)}
              className={`home-btn-primary my-2 ${
                selectedTarget === item ? "home-btn-selected" : ""
              }`}
            >
              {item}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFilteredWorkouts = () => (
    <div className="home-workout-list">
      {filteredWorkouts.length > 0 ? (
        filteredWorkouts.map((item) => (
          <div
            key={item.id}
            className="home-workout-item home-card animate__animated animate__fadeIn"
          >
            <img
              src={item.gifUrl}
              alt={item.name}
              className="home-card-img-top"
            />
          </div>
        ))
      ) : (
        <p>No workouts found for {selectedItem}</p>
      )}
    </div>
  );

  const renderYogaCategories = () => (
    <div className="home-quick-access-container">
      <div className="home-horizontal-scroll">
        {yogaCategories.map((category, index) => (
          <div key={index} className="home-quick-access-item m-1">
            <button
              onClick={() => handleYogaCategoryClick(category)}
              className={`home-btn-primary ${
                selectedYogaCategory?.id === category.id
                  ? "home-btn-selected"
                  : ""
              }`}
            >
              {category.category_name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderYogaData = () => (
    <div className="home-workout-list">
      {yogaData.length > 0 ? (
        yogaData.map((pose, index) => (
          <div
            key={index}
            className="home-workout-item home-card animate__animated animate__fadeIn"
          >
            {/* {console.log(pose)} */}
            <img
              src={pose.url_png} // Ensure this key name matches the data structure
              alt={pose.sanskrit_name} // Ensure this key name matches the data structure
              className="home-card-img-top"
            />
            {/* <div className="home-card-body">
              <h5 className="home-card-title">{pose.english_name}</h5>
              <p>{pose.sanskrit_name}</p>
            </div>
            {pose.categ} */}
          </div>
        ))
      ) : (
        <p>No poses found for {selectedYogaCategory?.name}</p>
      )}
    </div>
  );

  return (
    <div>
      <Navbar />
      {renderMainButtons()}
      {selectedType === "equipment" && renderEquipmentButtons()}
      {selectedType === "bodyPart" && renderBodyPartButtons()}
      {targets.length > 0 && renderTargetButtons()}
      {quickAccess === "yoga" ? (
        <>
          {renderYogaCategories()}
          {renderYogaData()}
        </>
      ) : (
        renderFilteredWorkouts()
      )}
    </div>
  );
}

export default App;
