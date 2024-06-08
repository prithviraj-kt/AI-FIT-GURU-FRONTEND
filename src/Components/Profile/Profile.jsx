import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from "../Navbar/Navbar";
import {
  Button,
  Modal,
  Spinner,
  Container,
  Row,
  Col,
  Form,
  Table,
} from "react-bootstrap";
import { FaCalendarAlt, FaFileDownload } from "react-icons/fa";
import { storage, db } from "../../config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import jsPDF from "jspdf";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const cropperRef = useRef(null);

  const [user, setUser] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [foodFile, setFoodFile] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [foodCategory, setFoodCategory] = useState("");
  const [foodSection, setFoodSection] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [foodModal, setFoodModal] = useState(false);
  const [previewURL, setPreviewURL] = useState("");
  const [foodPreviewURL, setFoodPreviewURL] = useState("");
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [viewReportModal, setViewReportModal] = useState(false);
  const [healthData, setHealthData] = useState({
    // height: "0 cm",
    // weight: "0 kg",
    // BMI: "0",
    // bodyFat: "0%",
  });
  const [foodItems, setFoodItems] = useState([]);
  const [height, setHeight] = useState(healthData.height);
  const [weight, setWeight] = useState(healthData.weight);
  const [BMI, setBMI] = useState(healthData.BMI);
  const [bodyFat, setBodyFat] = useState(healthData.bodyFat);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = await localStorage.getItem("email");
      if (!email) {
        navigate("/login");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        await fetchHealthData(email);
        await fetchAllFoodItems(email);
      }
    };
    fetchUserData();
  }, [navigate]);

  const fetchHealthData = async (email) => {
    const healthDoc = await getDoc(doc(db, "healthdata", email));
    if (healthDoc.exists()) {
      const healthData = healthDoc.data();
      setHealthData(healthData);
      setHeight(healthData.height);
      setWeight(healthData.weight);
      setBMI(healthData.BMI);
      setBodyFat(healthData.bodyFat);
    }
  };

  const fetchAllFoodItems = async (email) => {
    try {
      const foodQuery = query(
        collection(db, "food"),
        where("userEmail", "==", email)
      );
      const foodSnapshot = await getDocs(foodQuery);
      const foodData = [];
      foodSnapshot.forEach((doc) => {
        foodData.push(doc.data());
      });
      localStorage.setItem("foodItems", JSON.stringify(foodData));
      setFoodItems(foodData);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  useEffect(() => {
    const storedFoodItems = JSON.parse(localStorage.getItem("foodItems")) || [];
    const dateKey = selectedDate.toDateString();
    const filteredFoodItems = storedFoodItems.filter(
      (item) =>
        new Date(item.uploadTime.seconds * 1000).toDateString() === dateKey
    );
    setFoodItems(filteredFoodItems);
    setShowCalendar(false);
  }, [selectedDate]);

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setPreviewURL(URL.createObjectURL(event.target.files[0]));
      setShowModal(true);
    }
  };

  const handleFoodFileChange = (event) => {
    if (event.target.files[0]) {
      setFoodFile(event.target.files[0]);
      setFoodPreviewURL(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleUpload = async () => {
    const cropper = cropperRef.current.cropper;
    cropper.getCroppedCanvas().toBlob(async (blob) => {
      const croppedImage = new File([blob], `${user.email}.png`, {
        type: selectedFile.type,
        lastModified: Date.now(),
      });

      const storageRef = ref(storage, `profile_images/${user.email}.png`);
      const uploadTask = uploadBytesResumable(storageRef, croppedImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUser((prevUser) => ({
              ...prevUser,
              photoURL: `${downloadURL}?t=${new Date().getTime()}`, // Append timestamp to force refresh
            }));
            await setDoc(
              doc(db, "users", user.email),
              { photoURL: downloadURL },
              { merge: true }
            );
            setShowModal(false);
          } catch (error) {
            console.error("Error updating user data:", error);
          }
        }
      );
    });
  };

  const handleFoodUpload = async () => {
    setIsLoading(true);
    const storageRef = ref(storage, `food_images/${foodFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, foodFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newFoodItem = {
          userEmail: user.email,
          name: foodName,
          type: foodType,
          category: foodCategory,
          section: foodSection,
          imageURL: downloadURL,
          uploadTime: new Date(),
        };
        await setDoc(
          doc(db, "food", `${user.email}_${new Date().getTime()}`),
          newFoodItem
        );
        const updatedFoodItems = [...foodItems, newFoodItem];
        localStorage.setItem("foodItems", JSON.stringify(updatedFoodItems));
        setFoodItems(updatedFoodItems);
        setIsLoading(false);
        setFoodModal(false);
      }
    );
  };

  const handleSaveHealthData = async () => {
    try {
      const updatedHealthData = {
        height,
        weight,
        BMI,
        bodyFat,
      };
      await setDoc(doc(db, "healthdata", user.email), updatedHealthData);

      // Update the local state immediately after saving
      setHealthData(updatedHealthData);

      // Close the modal
      setShowHealthModal(false);
    } catch (error) {
      console.error("Error saving health data:", error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.text(`Name: ${user.firstName} ${user.lastName}`, 10, yOffset);
    doc.text(`Email: ${user.email}`, 10, (yOffset += 10));
    doc.text("Diet Data:", 10, (yOffset += 20));

    foodItems.forEach((item) => {
      const itemName = `Name: ${item.name}`;
      const itemType = `Type: ${item.type}`;
      const itemCategory = `Category: ${item.category}`;
      const itemSection = `Section: ${item.section}`;

      doc.text(itemName, 10, (yOffset += 10));
      doc.text(itemType, 10, (yOffset += 10));
      doc.text(itemCategory, 10, (yOffset += 10));
      doc.text(itemSection, 10, (yOffset += 10));

      yOffset += 10;
    });

    doc.save("diet_data.pdf");
  };

  const resetFoodForm = () => {
    setFoodName("");
    setFoodType("");
    setFoodCategory("");
    setFoodSection("");
    setFoodFile(null);
    setFoodPreviewURL("");
  };

  return (
    <div className="profile-dark-theme">
      <Navbar />
      <Container className="profile-container">
        <Row className="profile-row">
          <Col md={4} className="profile-img-col">
            <div className="profile-image-container">
              <img
                src={`${user.photoURL}?t=${new Date().getTime()}`}
                alt="Profile"
                className="profile-img"
              />
              <div className="profile-upload-btn-container">
                <label htmlFor="fileInput" className="profile-upload-btn">
                  Upload Profile Picture
                </label>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <h2 className="mt-3">{user.displayName}</h2>
            <p>{user.email}</p>
          </Col>
          <Col md={8} className="profile-info-col">
            <h4>Health Data</h4>
            <Button
              variant="primary"
              onClick={() => setViewReportModal(true)}
              className="profile-health-btn"
            >
              View Report
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowHealthModal(true)}
              className="profile-health-btn"
            >
              Edit Health Data
            </Button>
            <p>Height: {healthData.height}</p>
            <p>Weight: {healthData.weight}</p>
            <p>BMI: {healthData.BMI}</p>
            <p>Body Fat: {healthData.bodyFat}</p>

            <h4>Diet Data</h4>
            <Button
              variant="primary"
              onClick={() => setFoodModal(true)}
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
            {showCalendar && (
              <Calendar
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="mb-3"
              />
            )}

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Section</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.category}</td>
                    <td>{item.section}</td>
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
            <Button
              variant="success"
              onClick={downloadPDF}
              className="profile-download-btn"
            >
              <FaFileDownload /> Download PDF
            </Button>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Cropper
            ref={cropperRef}
            src={previewURL}
            style={{ height: 400, width: "100%" }}
            initialAspectRatio={1}
            aspectRatio={1}
            guides={false}
            minCropBoxWidth={100} // Adjust this value to match the width of your cropper window
            minCropBoxHeight={100} // Adjust this value to match the height of your cropper window
            autoCropArea={1} // Ensures the entire image is covered by the cropping area
            viewMode={1} // Ensures crop box is always within the boundaries of the image
          />

          {progress !== null && (
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={foodModal} onHide={() => setFoodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Food Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFoodName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFoodType">
              <Form.Label>Type</Form.Label>
              <div className="button-group">
                {["Veg", "Non-Veg", "Vegan"].map((type) => (
                  <Button
                    key={type}
                    variant={foodType === type ? "primary" : "outline-primary"}
                    onClick={() => setFoodType(type)}
                    className="mr-2"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formFoodCategory">
              <Form.Label>Category</Form.Label>
              <div className="button-group">
                {[
                  "Beverages",
                  "Drinks",
                  "Smoothie",
                  "Juice",
                  "Fruits",
                  "Raw Veggie",
                  "Full Meal",
                  "Quick Snack",
                ].map((category) => (
                  <Button
                    key={category}
                    variant={
                      foodCategory === category ? "primary" : "outline-primary"
                    }
                    onClick={() => setFoodCategory(category)}
                    className="mr-2"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formFoodSection">
              <Form.Label>Section</Form.Label>
              <div className="button-group">
                {[
                  "Morning Snack",
                  "Breakfast",
                  "Lunch",
                  "Evening Snack",
                  "Dinner",
                  "Midnight Snack",
                ].map((section) => (
                  <Button
                    key={section}
                    variant={
                      foodSection === section ? "primary" : "outline-primary"
                    }
                    onClick={() => setFoodSection(section)}
                    className="mr-2"
                  >
                    {section}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formFoodImage">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={handleFoodFileChange} />
              {foodPreviewURL && (
                <img
                  src={foodPreviewURL}
                  alt="Food Preview"
                  className="food-img"
                />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFoodModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleFoodUpload}
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showHealthModal} onHide={() => setShowHealthModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Health Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formHeight">
              <Form.Label>Height</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formWeight">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBMI">
              <Form.Label>BMI</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter BMI"
                value={BMI}
                onChange={(e) => setBMI(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBodyFat">
              <Form.Label>Body Fat</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter body fat"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHealthModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveHealthData}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={viewReportModal} onHide={() => setViewReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>View Health Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Height: {healthData.height}</p>
          <p>Weight: {healthData.weight}</p>
          <p>BMI: {healthData.BMI}</p>
          <p>Body Fat: {healthData.bodyFat}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewReportModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile;
