// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// const Aibot = () => {
//   const [chatHistory, setChatHistory] = useState([]);
//   const userMessageInputRef = useRef(null);

//   const sendMessage = async (message) => {
//     try {
//       const response = await axios.post('/chat', { userText: message });
//       const trainerResponse = response.data;
//       setChatHistory([...chatHistory, { message, isTrainer: false }, { message: trainerResponse, isTrainer: true }]);
//       userMessageInputRef.current.value = '';
//     } catch (error) {
//       console.error('Error sending message:', error);
//       // Handle errors gracefully (e.g., display an error message to the user)
//     }
//   };

//   const handleFormSubmit = (event) => {
//     event.preventDefault();
//     const message = userMessageInputRef.current.value.trim();
//     if (message) {
//       sendMessage(message);
//     }
//   };

//   useEffect(() => {
//     // Optional: Add an initial greeting message from the trainer
//     setChatHistory([{ message: "Hey there! I'm Hanuman, your AI personal trainer at Let's Workout. How can I help you today?", isTrainer: true }]);
//   }, []);

//   return (
//     <div className="aibot-container">
//       <div className="chat-container">
//         {chatHistory.map((message, index) => (
//           <div key={index} className={`message ${message.isTrainer ? 'trainer-message' : 'user-message'}`}>
//             <p className="message-text">{message.message}</p>
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleFormSubmit}>
//         <textarea ref={userMessageInputRef} className="user-message-input" placeholder="Type your message here"></textarea>
//         <button type="submit" className="send-button">Send</button>
//       </form>
//     </div>
//   );
// };

// export default Aibot;
/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyB4J5u081EY9HvKvSmZ-YXxxjPYhCpOqmc";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "Your name is Hanuman. You are a professional experienced coach and fitness trainer at Let's workout.  Let's Workout is a platform where you get workout and diet plan according to your schedule and requirements, you maybe having any sort of injuries or even allergies. We are here to make your goals achieve better and faster in a safe manner. You can allow personal trainer mode so that they can guide you through proper position and also count your reps and do lot more.\n\nThink of it as a personalized training program where I'm your coach, offering advice, workouts, and motivation. It's all about working together to get you the results you want! 💪",
});

const generationConfig = {
  temperature: 0.45,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function run(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Hii\n" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Hey there! 👋  It's great to meet you!  I'm Hanuman, your personal coach at Let's Workout!  \n\nWhat are your fitness goals?  Are you looking to build muscle, lose weight, improve endurance, or just feel better overall? Tell me a little about yourself, and we can get started on crafting a personalized plan just for you! \n",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(prompt);
  return result.response.text;
}

export default run;
