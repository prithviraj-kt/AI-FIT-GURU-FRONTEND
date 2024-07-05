import React, { useEffect, useState } from "react";
import { storage, db } from "../../../config";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
} from "firebase/storage";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

function Demoexercise() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const folderRef = ref(storage, "workout/waist");
        const workoutResponse = await axios.get(
          "http://localhost:8080/exercise"
        );
        const workoutData = workoutResponse.data.msg;

        const response = await listAll(folderRef);
        const accumulatedNames = [...names];

        response.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const name = itemRef.name
            .replace(/\.gif$/, "")
            .replace(/\(\d+\)/, "")
            .trim();
          workoutData.forEach((exercise) => {
            if (exercise.gifUrl.includes(name)) {
              exercise.gifUrl = url;
              accumulatedNames.push(exercise);
            }
          });
        });

        setNames(accumulatedNames);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);
  const handleClick = async () => {
    console.log(names);

    try {
      const workoutsCollection = collection(db, "workouts");

      //   const docRef = doc(workoutsCollection, "dummyDocumentId"); // Use a dummy document ID for checking
      //   const docSnap = await getDoc(docRef);

      //   if (!docSnap.exists()) {
      //     // Collection doesn't exist, create it
      //     console.log("Creating 'workouts' collection...");
      //     await setDoc(docRef, {}); // Create a dummy document
      //   }

      // Add exercises to Firestore
      await Promise.all(
        names.map(async (exercise) => {
          // Add a unique ID to each exercise if it's missing.
          if (!exercise.id) {
            exercise.id = Date.now().toString();
          }
          await setDoc(doc(workoutsCollection, exercise.id), exercise);
        })
      );

      console.log("Exercises stored in Firestore successfully.");
    } catch (error) {
      console.error("Error storing objects in Firestore:", error);
    }
  };

  const viewData = () => {
    console.log(names);
  };
  return (
    <div className="container">
      {/* <h1 className="my-4">Neck Exercises</h1> */}
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="row">
          {/* {images.map((image, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card">
                <img
                  src={image.url}
                  alt={`Neck Exercise ${index + 1}`}
                  className="card-img-top"
                />
                <div className="card-body">
                  <p className="card-text">{image.name}</p>
                </div>
                <div className="card-body">
                  <p className="card-text">{image.bodyPart}</p>
                </div>
              </div>
            </div>
          ))} */}
        </div>
      )}
      <div>
        <h2>Names</h2>
        <button onClick={handleClick}>clickme</button>
        <button onClick={viewData}>view data</button>
        <ul className="text-light">
          {names.length > 0 &&
            names.map((exercise) => (
              <li key={exercise.id}>
                <p>Name: {exercise.name}</p>
                <p>gifUrl: {exercise.gifUrl}</p>
                <img src={exercise.gifUrl} alt="" />
                <p>ID: {exercise.id}</p>
                <strong>Body Part: {exercise.bodyPart}</strong>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Demoexercise;
