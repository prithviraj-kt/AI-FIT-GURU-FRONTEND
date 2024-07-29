import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";
import { db } from "../../config";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Profile.css";
import run from "./calorieburntbot";

const WorkoutSchedule = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutType, setWorkoutType] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [isToday, setIsToday] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    fetchWorkouts(selectedDate);
  }, [selectedDate]);

  const fetchWorkouts = async (date) => {
    const email = await localStorage.getItem("email");
    const formattedDate = date.toISOString().split("T")[0];

    try {
      const workoutsCollection = collection(db, "dailyworkouts");
      const q = query(
        workoutsCollection,
        where("email", "==", email),
        where("date", "==", formattedDate)
      );
      const querySnapshot = await getDocs(q);
      const fetchedWorkouts = querySnapshot.docs.map((doc) => doc.data());
      setWorkouts(fetchedWorkouts);
      const totalCalories = fetchedWorkouts.reduce(
        (total, workout) => total + parseInt(workout.calories_burnt),
        0
      );
      setTotalCalories(totalCalories);
    } catch (error) {
      console.error("Error fetching workouts: ", error);
    }
  };

  const handleWorkoutSubmit = async () => {
    const workoutDataUser = {
      workoutType,
      timeSpent,
    };

    const response = JSON.parse(await run(JSON.stringify(workoutDataUser)));
    const email = await localStorage.getItem("email");
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const dailyWorkoutsRef = collection(db, "dailyworkouts");

    const workoutData = {
      email,
      date: formattedDate,
      workoutType,
      timeSpent,
      calories_burnt: response.calories_burnt,
    };

    try {
      await setDoc(
        doc(dailyWorkoutsRef, `${email}-${formattedDate}-${workoutType}`),
        workoutData,
        { merge: true }
      );
      alert("Workout added successfully!");
      fetchWorkouts(selectedDate);
    } catch (error) {
      console.error("Error adding workout: ", error);
      alert("Error adding workout. Please try again.");
    }

    setShowWorkoutModal(false);
  };

  const workoutTypes = [
    "medium walk",
    "brisk walk",
    "jogging",
    "running",
    "yoga",
    "sports",
    "athletics",
    "weight lifting",
    "cross fit",
    "Pilates",
    "Zumba",
    "Cycling",
    "Swimming",
    "Dance Fitness",
    "HIIT (High-Intensity Interval Training)",
    "Barre",
    "Bootcamp",
    "Rock Climbing",
    "Hiking",
    "Kickboxing",
    "Tai Chi",
    "Strength Training",
    "Calisthenics",
    "Karate",
    "Taekwondo",
    "Judo",
    "Brazilian Jiu-Jitsu",
    "Muay Thai",
    "Aikido",
    "Krav Maga",
    "Kung Fu",
    "Capoeira",
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowCalendar(false); // Close the calendar automatically
    const today = new Date();
    setIsToday(
      date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div>
      <div className="profile-card profile-card-dark">
        {totalCalories > 0 && (
          <h4>Total Calories Burnt: {totalCalories} calories</h4>
        )}

        <div className="profile-btn-group">
          <Button
            variant="primary"
            onClick={() => setShowWorkoutModal(true)}
            className="profile-diet-btn"
            disabled={!isToday}
          >
            Add workout
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowCalendar(true)}
            className="profile-calendar-btn"
          >
            <FaCalendarAlt />
          </Button>
        </div>
        <Container className="mt-4">
          {workouts.length > 0 ? (
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Workout Type</th>
                  <th>Time Spent (minutes)</th>
                  <th>Calories Burnt</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((workout, index) => (
                  <tr key={index}>
                    <td>{workout.workoutType}</td>
                    <td>{workout.timeSpent}</td>
                    <td>{workout.calories_burnt}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No workouts found.....</p>
          )}
        </Container>
      </div>

      <Modal show={showCalendar} onHide={() => setShowCalendar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Calendar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCalendar(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWorkoutModal}
        onHide={() => setShowWorkoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Workout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Workout Type</Form.Label>
              <div>
                {workoutTypes.map((type) => (
                  <Button
                    key={type}
                    variant="outline-primary"
                    className={`m-1 ${workoutType === type ? "active" : ""}`}
                    onClick={() => setWorkoutType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Time Spent (minutes)</Form.Label>
              <Form.Control
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWorkoutModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleWorkoutSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkoutSchedule;
