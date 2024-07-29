/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyDv5Vln4c6BHvz5hcMNdN7PjnMpqqxtFgs";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction:
    'You are expert in calorie calculator, you will be given type of workout and the duration performed, you have to return the amount of calories burnt by that person. And the workout duration will be in minutes. Be highly accurate please\nreturn in the format\n{\n"calories_burnt":value\n}',
});

const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run(prompt) {
  const chatSession = model.startChat({
    generationConfig,

    history: [
      {
        role: "user",
        parts: [{ text: '{\nworkoutType:"brisk walk",\nduration:"100"\n}' }],
      },
      {
        role: "model",
        parts: [{ text: '{"calories_burnt": "350"}\n\n' }],
      },
    ],
  });
  console.log(prompt);
  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}
export default run;
