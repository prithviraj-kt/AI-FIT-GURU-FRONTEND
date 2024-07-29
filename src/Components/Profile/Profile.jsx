import React, { useState, useEffect, useRef, useCallback } from "react";
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
import axios from "axios";
import run from "./caloriebot";
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
import imageCompression from "browser-image-compression";
import WorkoutSchedule from "./WorkoutSchedule";
// import run from "./Ai/model";
function Profile() {
  const navigate = useNavigate();
  const cropperRef = useRef(null);

  const [user, setUser] = useState({
    photoURL:
      "https://i.pinimg.com/originals/6b/aa/98/6baa98cc1c3f4d76e989701746e322dd.png",
  });
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
  const [viewWorkout, setViewWorkout] = useState(false);
  const [viewDiet, setViewDiet] = useState(false);
  const [healthData, setHealthData] = useState({});
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    workoutFrequency: "",
    goal: "",
    fitnessLevel: "",
    dailyActiveLevel: "",
    workoutIntensity: "",
    sleepDuration: "",
    healthIssues: "",
  });

  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [dietPlan, setDietPlan] = useState([]);
  const [day, setDay] = useState("");

  // Calculated values
  const [bmi, setBMI] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  //AI Images
  const fileTypes = ["JPG", "JPEG", "PNG", "SVG", "AVIF", "WEBP"];
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showFoodDetailsModal, setShowFoodDetailsModal] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [isToday, setIsToday] = useState(true);

  const handleDrop = async (file) => {
    if (file) {
      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const base64Data = await fileToBase64(compressedFile);
        await setImages([{ src: base64Data, name: compressedFile.name }]);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  const trimLeadingWhitespace = (sentence) => {
    let trimmedSentence = sentence.replace(/^\s+/, "");
    return trimmedSentence;
  };

  const handleGenerate = async () => {
    if (!images || images.length === 0) {
      console.log("No image provided.");
      return;
    }

    setGeneratedText("");
    setLoading(true);

    try {
      const apiKey = "AIzaSyDv5Vln4c6BHvz5hcMNdN7PjnMpqqxtFgs";
      const prompt =
        "You are an expert nutritionist. Analyze the image and provide a calorie breakdown of the food items present. " +
        "Return the data only in JSON format as an array of objects. " +
        "Each object should have the following structure: \n" +
        `{
          "name": "item name", 
          "quantity": "estimated quantity (e.g., 1 slice, 200g)", 
          "calorie_count": 120, // number only
          "other_instructions": "Additional notes (optional)" 
        }\n` +
        "Ensure to identify all food items and provide calorie counts as accurately as possible. Do not return undefined or empty JSON.";

      const imagePart = {
        image: {
          source: images[0].src,
        },
      };

      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const image = {
        inlineData: {
          data: images[0].src,
          mimeType: "image/png",
        },
      };

      const result = await model.generateContent([prompt, image]);
      // console.log(result.response.text());

      // const requestData = {
      //   model: 'models/gemini-pro-vision', // Specify the model
      //   prompt: {
      //     text: prompt,
      //   },
      //   input: imagePart,
      // };

      // const response = await axios.post(
      //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent`,
      //   requestData,
      //   {
      //     params: { key: apiKey },
      //     headers: { "Content-Type": "application/json" },
      //   }
      // );

      setLoading(false);
      const generatedText = result;
      console.log("So it is " + generatedText);

      if (generatedText) {
        try {
          // Attempt to parse the response as JSON
          const jsonData = JSON.parse(generatedText);
          console.log(jsonData);
          // return jsonData; // Return the parsed JSON data
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // Handle cases where the response is not valid JSON
          return generatedText;
        }
      } else {
        console.log("No text generated by the API.");
        return null;
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  // const imageNotNull = images[0];

  // async function fileToGenerativePart() {}
  useEffect(() => {
    const fetchUserData = async () => {
      const email = await localStorage.getItem("email");
      if (!email) {
        navigate("/");
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

      const workoutPlan = await getDoc(doc(db, "workoutplan", email));
      if (workoutPlan.exists()) {
        setWorkoutPlan(workoutPlan.data().workoutPlan);
      }

      const dietplan = await getDoc(doc(db, "dietPlan", email));
      if (dietplan.exists()) {
        setDietPlan(dietplan.data().diet);
      }
    };
    fetchUserData();

    const getDay = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const currentDayOfWeek = daysOfWeek[dayOfWeek];
      setDay(currentDayOfWeek);
    };
    getDay();
  }, [navigate]);

  const fetchHealthData = async (email) => {
    const healthDoc = await getDoc(doc(db, "healthdata", email));
    if (healthDoc.exists()) {
      const healthData = healthDoc.data();
      setHealthData(healthData);

      // Set form data with existing values
      setFormData({
        age: healthData.age || "",
        height: healthData.height || "",
        weight: healthData.weight || "",
        gender: healthData.gender || "",
        workoutFrequency: healthData.workoutFrequency || "",
        goal: healthData.goal || "",
        fitnessLevel: healthData.fitnessLevel || "",
        dailyActiveLevel: healthData.dailyActiveLevel || "",
        workoutIntensity: healthData.workoutIntensity || "",
        sleepDuration: healthData.sleepDuration || "",
        healthIssues: healthData.healthIssues || "",
      });

      // Set calculated values
      setBMI(healthData.BMI || "");
      setBodyFatPercentage(healthData.bodyFat || "");

      await localStorage.setItem("report", JSON.stringify(healthData));
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
      setAllFoodItems(foodData);
      filterFoodItemsByDate(foodData, selectedDate);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  const filterFoodItemsByDate = (items, date) => {
    const dateKey = date.toDateString();
    const filteredItems = items.filter(
      (item) =>
        new Date(item.uploadTime.seconds * 1000).toDateString() === dateKey
    );
    setFoodItems(filteredItems);
  };

  useEffect(() => {
    filterFoodItemsByDate(allFoodItems, selectedDate);
  }, [selectedDate, allFoodItems]);

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setPreviewURL(URL.createObjectURL(event.target.files[0]));
      setShowModal(true);
    }
  };
  const [img, setImg] = useState(null);
  const handleFoodFileChange = (event) => {
    if (event.target.files[0]) {
      setImg(event);
      handleDrop(event.target.files[0]);
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
              photoURL: `${downloadURL}?t=${new Date().getTime()}`,
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

  const totalCalorie = async (items) => {
    var cal = 0;
    for (var i = 0; i < items.length; i++) {
      cal += parseInt(items[i].calorie_count);
    }
    return cal;
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
        const aiGeneratedFoodDetails = await handleGenerate();
        let foodDetailsString =
          aiGeneratedFoodDetails.response.candidates[0].content.parts[0].text;

        // Remove any backticks or other unwanted characters
        foodDetailsString = foodDetailsString.replace(/`/g, "");
        foodDetailsString = foodDetailsString.replace(/json/g, "");

        // Now attempt to parse the cleaned JSON string

        try {
          const foodDetailsJson = foodDetailsString;
          var totalCal = await totalCalorie(JSON.parse(foodDetailsJson));
          console.log(totalCal);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const newFoodItem = {
            userEmail: user.email,
            aiGeneratedFoodDetails: JSON.parse(foodDetailsJson),
            name: foodName,
            type: foodType,
            category: foodCategory,
            section: foodSection,
            totalCalorie: totalCal,
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
          resetFoodForm();
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  };

  const handleSaveHealthData = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Assuming `run` is a function that calculates health data and returns a result
      const response = await run(JSON.stringify(formData));

      // Log the entire response to debug
      console.log("Raw response from run:", response);

      // Check if response.msg exists
      if (response && response.msg) {
        const calorieBot = JSON.parse(response.msg);
        console.log("Parsed calorieBot:", calorieBot);

        // Extract values from the parsed object
        const calculatedBMI = calorieBot.Bmi;
        const estimatedBodyFat = calorieBot.Body_Fat;
        const calorieIntake = calorieBot.Suggested_Calorie_Intake;
        const maintenanceCalories = calorieBot.Maintenance_Calorie;

        const healthDocRef = doc(db, "healthdata", user.email);
        await setDoc(
          healthDocRef,
          {
            ...formData,
            BMI: calculatedBMI,
            Body_Fat: estimatedBodyFat,
            Maintenance_Calories: maintenanceCalories,
            Suggested_Calorie_Intake: calorieIntake,
          },
          { merge: true }
        );

        // Update local state with calculated values
        setBMI(calculatedBMI);
        setBodyFatPercentage(estimatedBodyFat);
        setHealthData((prevHealthData) => ({
          ...prevHealthData,
          ...formData,
          BMI: calculatedBMI,
          bodyFat: estimatedBodyFat,
          maintenanceCalories: maintenanceCalories,
          Suggested_Calorie_Intake: calorieIntake,
        }));

        setShowHealthModal(false);
      } else {
        throw new Error("Invalid response format from run function");
      }
    } catch (error) {
      console.error("Error saving health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFoodDetails = (item) => {
    setSelectedFoodItem(item);
    setShowFoodDetailsModal(true);
  };
  // Function to calculate BMI
  const calculateBMI = (height, weight) => {
    if (!height || !weight) {
      return "";
    }
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // Function to calculate Body Fat Percentage (Approximate)
  const estimateBodyFatPercentage = (bmi, gender) => {
    if (!bmi || !gender) {
      return "";
    }
    let bodyFatPercentage;
    if (gender.toLowerCase() === "male") {
      bodyFatPercentage = 1.2 * bmi + 0.23 * parseInt(formData.age) - 16.2;
    } else if (gender.toLowerCase() === "female") {
      bodyFatPercentage = 1.2 * bmi + 0.23 * parseInt(formData.age) - 5.4;
    } else {
      return "";
    }
    return bodyFatPercentage.toFixed(2);
  };
  const calculateBMR = (weight, height, age, gender) => {
    if (!weight || !height || !age || !gender) {
      return "";
    }

    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);

    let bmr;
    if (gender.toLowerCase() === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else if (gender.toLowerCase() === "female") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    } else {
      return "";
    }

    return bmr;
  };

  // Function to estimate Maintenance Calories
  const calculateMaintenanceCalories = (bmr, activityLevel) => {
    if (!bmr || !activityLevel) {
      return "";
    }

    let activityMultiplier;
    switch (activityLevel) {
      case "Very lazy":
        activityMultiplier = 1.2;
        break;
      case "Lazy":
        activityMultiplier = 1.375;
        break;
      case "Moderately active":
        activityMultiplier = 1.55;
        break;
      case "Active":
        activityMultiplier = 1.725;
        break;
      case "Super active":
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.2;
    }

    return (bmr * activityMultiplier).toFixed(0); // Round to nearest whole number
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.text(`Name: ${user.displayName} `, 10, yOffset);
    doc.text(`Email: ${user.email}`, 10, (yOffset += 10));
    doc.text("Health Data:", 10, (yOffset += 20));

    doc.text(`BMI: ${bmi}`, 10, (yOffset += 10));
    doc.text(`Body Fat: ${bodyFatPercentage}%`, 10, (yOffset += 10));

    Object.entries(healthData)
      .filter(([key]) => key !== "BMI" && key !== "bodyFat")
      .forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, (yOffset += 10));
      });

    doc.text("Add food item:", 10, (yOffset += 20));

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

    doc.save("health_and_diet_data.pdf");
  };

  const resetFoodForm = () => {
    setFoodName("");
    setFoodType("");
    setFoodCategory("");
    setFoodSection("");
    setFoodFile(null);
    setFoodPreviewURL("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleButtonClick = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const goToPersonalWorkout = async (workout) => {
    await localStorage.setItem("personalworkout", JSON.stringify(workout));
    navigate("/personalworkout");
  };

  return (
    <div className="profile-dark-theme">
      <Navbar />
      <Container className="profile-container">
        <div className="row profile-row d-flex flex-row">
          <div className="col-md-4 profile-img-col">
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
          </div>
          <div className="col-md-8 profile-info-col">
            <div className="profile-card profile-card-dark">
              <h4>Health Data</h4>
              <div className="profile-btn-group">
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
              </div>
            </div>
            <div className="profile-card profile-card-dark">
              <h4>Workout Plan</h4>
              <div className="profile-btn-group">
                {workoutPlan.length > 1 ? (
                  <Button
                    variant="primary"
                    className="profile-health-btn"
                    onClick={() => setViewWorkout(true)}
                  >
                    View Complete Workout Plan
                  </Button>
                ) : (
                  ""
                )}
              </div>
              {workoutPlan.length > 1 ? (
                ""
              ) : (
                <Button
                  variant="primary"
                  className=""
                  onClick={() => navigate("/trainer")}
                >
                  Create new workout plan
                </Button>
              )}
              {workoutPlan.map(
                (dayPlan, index) =>
                  // Remove the extra <div> and else condition ("")
                  day.toLowerCase() === dayPlan.day.toLowerCase() && (
                    <div key={index} className="aitrainer-day-plan">
                      <h5 className="text-warning">
                        Todays workout plan ({" "}
                        {dayPlan.day.charAt(0).toUpperCase() +
                          dayPlan.day.slice(1)}
                        : {dayPlan.bodyPart.join(", ")})
                      </h5>
                      <ul>
                        {dayPlan.workout.map((exercise, i) => (
                          <li key={i}>{exercise.name}</li>
                        ))}
                      </ul>
                      <div className="profile-btn-group">
                        <Button
                          variant="primary"
                          className=""
                          onClick={() => goToPersonalWorkout(dayPlan.workout)}
                        >
                          Lets start
                        </Button>
                        <Button
                          variant="primary"
                          className=""
                          onClick={() => navigate("/trainer")}
                        >
                          Change plan
                        </Button>
                      </div>
                    </div>
                  )
              )}
            </div>
            <div className="profile-card profile-card-dark">
              <h4>Diet Plan</h4>
              <div className="profile-btn-group">
                {dietPlan.length > 1 ? (
                  <Button
                    variant="primary"
                    className="profile-health-btn"
                    onClick={() => setViewDiet(true)}
                  >
                    View Complete Diet Plan
                  </Button>
                ) : (
                  ""
                )}
              </div>
              {dietPlan.length > 1 ? (
                ""
              ) : (
                <Button
                  variant="primary"
                  onClick={() => navigate("/neutritionist")}
                >
                  Create new diet plan
                </Button>
              )}
              {dietPlan.map(
                (diet, index) =>
                  day.toLowerCase() === diet.day.toLowerCase() && (
                    <div key={index} className="aitrainer-day-plan">
                      <h5 className="text-warning">
                        Today's Meals (
                        {diet.day.charAt(0).toUpperCase() + diet.day.slice(1)})
                      </h5>
                      <table className="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th scope="col">Meal Time</th>
                            <th scope="col">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(diet.meals)
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([mealTime, meal], idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>
                                    {mealTime.split(" ").slice(1).join(" ")}
                                  </strong>
                                </td>
                                <td>{meal}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <Button
                        variant="primary"
                        onClick={() => navigate("/neutritionist")}
                      >
                        Change plan
                      </Button>
                    </div>
                  )
              )}
            </div>

            <div className="profile-card profile-card-dark">
              {foodItems.length > 0 && (
                <div>
                  <h4>
                    Total calorie Intake:{" "}
                    {foodItems.reduce(
                      (acc, item) => acc + item.totalCalorie,
                      0
                    )}{" "}
                    Calories
                  </h4>
                </div>
              )}

              {/* <h4>Add food item</h4> */}
              <div className="profile-btn-group">
                <Button
                  variant="primary"
                  onClick={() => setFoodModal(true)}
                  className="profile-diet-btn"
                  disabled={!isToday}
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
                    const today = new Date();
                    setIsToday(
                      date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear()
                    );
                  }}
                  className="mb-3"
                />
              )}
              {foodItems.length > 0 ? (
                <Table
                  className="profile-diet-data"
                  striped
                  bordered
                  hover
                  variant="dark"
                >
                  <thead>
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
                        {/* {JSON.stringify(item.uploadTime)} */}
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
              ) : (
                <p className="text-light">No food items found....</p>
              )}
            </div>
            <WorkoutSchedule />
            <Button
              variant="success"
              onClick={downloadPDF}
              className="profile-download-btn"
            >
              <FaFileDownload /> Download PDF
            </Button>
          </div>
        </div>
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
            minCropBoxWidth={100}
            minCropBoxHeight={100}
            autoCropArea={1}
            viewMode={1}
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
            <Form.Group controlId="formFoodImage">
              <Form.Label>Image</Form.Label>
              {foodPreviewURL && (
                <img
                  src={foodPreviewURL}
                  alt="Food Preview"
                  className="food-img"
                />
              )}
              <Form.Control type="file" onChange={handleFoodFileChange} />
            </Form.Group>
            {/* <Form.Group controlId="formFoodName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </Form.Group> */}
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
          <Form onSubmit={handleSaveHealthData}>
            <Form.Group controlId="formAge">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formHeight">
              <Form.Label>Height (in cm)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formWeight">
              <Form.Label>Weight (in kg)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
              />
            </Form.Group>
            {/* <Form.Group controlId="formBMI">
              <Form.Label>BMI</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter BMI"
                name="BMI"
                value={formData.BMI}
                onChange={handleInputChange}
              />
            </Form.Group> */}
            {/* <Form.Group controlId="formBodyFat">
              <Form.Label>Body Fat</Form.Label>
              <Form.Control
                as="select"
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleInputChange}
              >
                {[
                  "below 10%",
                  "10-15%",
                  "15-20%",
                  "20-25%",
                  "25-30%",
                  "30-35%",
                  "35-40%",
                  "40-45%",
                  "45-50%",
                  "above 50%",
                ].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Control>
            </Form.Group> */}
            <Form.Group controlId="formGender">
              <Form.Label>Gender</Form.Label>
              <div className="button-group">
                {["male", "female", "cannot specify"].map((gender) => (
                  <Button
                    key={gender}
                    variant={
                      formData.gender === gender ? "primary" : "outline-primary"
                    }
                    onClick={() => handleButtonClick("gender", gender)}
                    className="mr-2"
                    type="button"
                  >
                    {gender}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group controlId="formWorkoutFrequency">
              <Form.Label>
                Workout Frequency (No of times you do workout)
              </Form.Label>
              <div className="button-group">
                {[1, 2, 3, 4, 5, 6, 7].map((frequency) => (
                  <Button
                    key={frequency}
                    variant={
                      formData.workoutFrequency === frequency.toString()
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() =>
                      handleButtonClick(
                        "workoutFrequency",
                        frequency.toString()
                      )
                    }
                    className="mr-2"
                    type="button"
                  >
                    {frequency}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formGoal">
              <Form.Label>Goal</Form.Label>
              <div className="button-group">
                {[
                  "Muscle gain",
                  "Fat loss",
                  "Maintain fitness",
                  "Build strength",
                ].map((goal) => (
                  <Button
                    key={goal}
                    variant={
                      formData.goal === goal ? "primary" : "outline-primary"
                    }
                    onClick={() => handleButtonClick("goal", goal)}
                    className="mr-2"
                    type="button"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formFitnessLevel">
              <Form.Label>Current Fitness Level</Form.Label>
              <div className="button-group">
                {[
                  "Very lean",
                  "Little fit",
                  "Normal and healthy",
                  "Obese",
                  "Fat with muscle",
                  "Intermediate fitness",
                  "Athletic personality",
                  "Body builder",
                ].map((level) => (
                  <Button
                    key={level}
                    variant={
                      formData.fitnessLevel === level
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => handleButtonClick("fitnessLevel", level)}
                    className="mr-2"
                    type="button"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formDailyActiveLevel">
              <Form.Label>Daily Active Level</Form.Label>
              <div className="button-group">
                {[
                  "Very lazy",
                  "Lazy",
                  "Active",
                  "Moderatively active",
                  "Super active",
                ].map((level) => (
                  <Button
                    key={level}
                    variant={
                      formData.dailyActiveLevel === level
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => handleButtonClick("dailyActiveLevel", level)}
                    className="mr-2"
                    type="button"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formWorkoutIntensity">
              <Form.Label>Daily Preferred Workout Intensity</Form.Label>
              <div className="button-group">
                {["1 time", "2 times", "3 times"].map((intensity) => (
                  <Button
                    key={intensity}
                    variant={
                      formData.workoutIntensity === intensity
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() =>
                      handleButtonClick("workoutIntensity", intensity)
                    }
                    className="mr-2"
                    type="button"
                  >
                    {intensity}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formSleepDuration">
              <Form.Label>Avg Sleep Duration</Form.Label>
              <div className="button-group">
                {[
                  "3-4 hours",
                  "5-6 hours",
                  "7-8 hours",
                  "9-10 hours",
                  "More than 10 hours",
                ].map((duration) => (
                  <Button
                    key={duration}
                    variant={
                      formData.sleepDuration === duration
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => handleButtonClick("sleepDuration", duration)}
                    className="mr-2"
                    type="button"
                  >
                    {duration}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formHealthIssues">
              <Form.Label>
                Any health issues? (e.g., shoulder pain, lower back pain)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter any health issues"
                name="healthIssues"
                value={formData.healthIssues}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={viewDiet} onHide={() => setViewDiet(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Diet Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dietPlan.map((diet, index) => (
            <div key={index} className="aitrainer-day-plan">
              <h5 className="text-warning">
                {diet.day.charAt(0).toUpperCase() + diet.day.slice(1)}:{" "}
              </h5>
              <ul>
                {Object.entries(diet.meals).map(([mealTime, meal], idx) => (
                  <li key={idx} className="list-group-item">
                    <strong>{mealTime}:</strong> {meal}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewDiet(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={viewWorkout} onHide={() => setViewWorkout(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Workout Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="workout-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Body Part</th>
                <th>Workout</th>
              </tr>
            </thead>
            <tbody>
              {workoutPlan.map((dayPlan, index) => (
                <tr key={index} className="workout-row">
                  <td className="workout-day">{dayPlan.day}</td>
                  <td className="workout-body-part">
                    {dayPlan.bodyPart.join(", ")}
                  </td>
                  <td className="workout-details">
                    {dayPlan.workout.length === 0
                      ? "Rest"
                      : dayPlan.workout.map((workout, idx) => (
                          <div key={idx} className="workout-item">
                            {workout.name} ({workout.bodyPart})
                          </div>
                        ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewWorkout(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={viewReportModal} onHide={() => setViewReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>View Health Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.entries(healthData).map(([key, value]) => (
            <p key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
            </p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewReportModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      // ... [rest of your component code]
      {/* Food Details Modal - Dark Theme */}
      <Modal
        show={showFoodDetailsModal}
        onHide={() => setShowFoodDetailsModal(false)}
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Food Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedFoodItem &&
          Array.isArray(selectedFoodItem.aiGeneratedFoodDetails) &&
          selectedFoodItem.aiGeneratedFoodDetails.length > 0 ? (
            <div>
              {selectedFoodItem.aiGeneratedFoodDetails.map((food, index) => (
                <div key={index} className="mb-3">
                  <h4>{food.name}</h4>
                  <ul className="list-unstyled">
                    <li>
                      <strong>Quantity:</strong> {food.quantity}
                    </li>
                    <li>
                      <strong>Calories:</strong> {food.calorie_count}
                    </li>
                    <li>
                      <strong>Instructions:</strong> {food.other_instructions}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>No food details available for this item.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button
            variant="secondary"
            onClick={() => setShowFoodDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      // ... [rest of your component code]
    </div>
  );
}

export default Profile;
