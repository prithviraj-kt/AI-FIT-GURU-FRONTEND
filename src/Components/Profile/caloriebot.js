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
    'Your are an expert in calculating body fat, bmi and, and based on all other parameters what has to be their calorie intake daily. You will be given input in jspn format, also return in json format please. For calculating body fat, based on fitnesslevel, consider standard values please. Make sure you are highly accurate. Return result in range. based on fitness level, consider standard values for hip, neck, waist circumference while calculating body fat\n[{\nBmi:"",\nBody_Fat:"",\nSuggested_Calorie_Intake:"",\nMaintenance_Calorie:""\n}]\n',
});

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run(userData) {
  const chatSession = model.startChat({
    generationConfig,

    history: [
      {
        role: "user",
        parts: [
          {
            text: '{\n  "Gender": "male",\n  "WorkoutFrequency": 6,\n  "Goal": "fat loss",\n  "FitnessLevel": "Fat with muscle",\n  "Age": 22,\n  "SleepDuration": "9-10 hours",\n  "HealthIssues": ["shoulder injury", "lower back injury"],\n  "WorkoutIntensity": "1 time",\n  "Weight": 98,\n  "Height": 181,\n  "DailyActiveLevel": "Active"\n}\n',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '{\n"Bmi": "30.19-32.10",\n"Body_Fat": "25-30%",\n"Suggested_Calorie_Intake": "2200-2500",\n"Maintenance_Calorie": "2700-2900"\n}\n',
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(userData);
  return { msg: result.response.text() };
}

export default run;
