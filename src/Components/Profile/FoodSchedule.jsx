import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";
import { db } from "../../config";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Profile.css";

const FoodIntake = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodItems, setFoodItems] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    fetchFoodItems(selectedDate);
  }, [selectedDate]);

  const fetchFoodItems = async (date) => {
    const email = await localStorage.getItem("email");
    const formattedDate = date.toISOString().split("T")[0];

    try {
      const foodCollection = collection(db, "dailyfood");
      const q = query(
        foodCollection,
        where("email", "==", email),
        where("date", "==", formattedDate)
      );
      const querySnapshot = await getDocs(q);
      const fetchedFoodItems = querySnapshot.docs.map((doc) => doc.data());
      setFoodItems(fetchedFoodItems);

      // Calculate total calories
      const total = fetchedFoodItems.reduce((sum, item) => sum + item.totalCalorie, 0);
      setTotalCalories(total);
    } catch (error) {
      console.error("Error fetching food items: ", error);
    }
  };

  const handleFoodSubmit = async () => {
    // Implementation of food submission logic goes here
  };

  return (
    <div className="profile-card profile-card-dark">
      <h4>Add food item</h4>
      <div className="profile-btn-group">
        <Button
          variant="primary"
          onClick={() => setShowFoodModal(true)}
          className="profile-diet-btn"
        >
          Add Food Item
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowCalendar(!showCalendar)}
          className="profile-calendar-btn"
        >
          <FaCalendarAlt />
        </Button>
      </div>
      {showCalendar && (
        <Calendar
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
          className="mb-3"
        />
      )}
      {foodItems.length > 0 ? (
        <>
          <Table className="profile-diet-data" striped bordered hover variant="dark">
            <thead>
              <tr>
                <th colSpan="6">Total Calorie Intake: {totalCalories}</th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Section</th>
                <th>Total Calories</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <Button
                      variant="info"
                      onClick={() => handleViewFoodDetails(item)}
                    >
                      View Details
                    </Button>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.category}</td>
                  <td>{item.section}</td>
                  <td>{item.totalCalorie}</td>
                  <td>
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="food-img"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <p className="text-light">No food items found....</p>
      )}

      {/* Food Modal */}
      <Modal
        show={showFoodModal}
        onHide={() => setShowFoodModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Food Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Form implementation for adding food item */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFoodModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleFoodSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FoodIntake;
