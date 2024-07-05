import React, { useState, useCallback } from "react";
import { FileUploader } from "react-drag-drop-files";
import axios from "axios";
// import config from "./config/api_key.json";
// import CircularProgress from "@mui/joy/CircularProgress";
import imageCompression from "browser-image-compression";

function App() {
  const fileTypes = ["JPG", "JPEG", "PNG", "SVG", "AVIF", "WEBP"];
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const handleDrop = useCallback(async (file) => {
    if (file) {
      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const base64Data = await fileToBase64(compressedFile);
        setImages([{ src: base64Data, name: compressedFile.name }]);
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

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
    if (images.length === 0 || images === null) {
      console.log("No image");
      return;
    }

    setGeneratedText("");

    try {
      const apiKey = "AIzaSyDv5Vln4c6BHvz5hcMNdN7PjnMpqqxtFgs";
      const prompt =
        'You are an expert nutritionist. Your task will be pretty simple. You will be gettig image url, look at the image in it, Look at every item carefully in the image and process. You have to return the amount of calories in it and name of the item in the specific format. There might be multiple items, so return in the below format\n[\n{name:"apple",\nquantity:"",\ncalorie_count:"100",\nother_instructions:""\n}\n]\nJust retuurn the json object, and in calorie field only return a number. If you wan to add any other information, add it to the other_instructions array please.';
      const imagePart = {
        inline_data: {
          mime_type: "image/jpeg",
          data: images[0].src,
        },
      };

      const requestData = {
        contents: [
          {
            parts: [{ text: prompt }, imagePart],
          },
        ],
      };

      setLoading(true);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent`,
        requestData,
        {
          params: {
            key: apiKey,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);

      let generatedText =
        response.data?.candidates[0]?.content?.parts[0]?.text.toString();
      let trimmedSentence = trimLeadingWhitespace(generatedText);
      let firstCharSmallLetterSentences =
        trimmedSentence.at(0).toLowerCase() + trimmedSentence.slice(1);
      setGeneratedText(firstCharSmallLetterSentences);
      if (firstCharSmallLetterSentences.slice(-1) == ".") {
        let deleteDot = firstCharSmallLetterSentences.slice(0, -1);
        setGeneratedText(deleteDot);
      }
    } catch (error) {
      console.error("Error generating content :", error);
      setLoading(false);
    }
  };

  const imageNotNull = images[0];

  return (
    <div>
      {imageNotNull ? (
        <img
          src={`data:image/jpeg;base64,${images[0].src}`}
          alt={images.name}
          style={{ maxWidth: "50%", maxHeight: "50%", margin: "5px" }}
        />
      ) : (
        <></>
      )}

      <FileUploader handleChange={handleDrop} name="file" types={fileTypes} />

      {loading ? (
        "Loading..."
      ) : (
        <button onClick={handleGenerate}>Generate Caption</button>
      )}

      {generatedText && <div>{generatedText}</div>}
    </div>
  );
}

export default App;
