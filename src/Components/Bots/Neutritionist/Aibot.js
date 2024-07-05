// const {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } = require("@google/generative-ai");

// const apiKey = "AIzaSyDv5Vln4c6BHvz5hcMNdN7PjnMpqqxtFgs";
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-pro",
//   systemInstruction:
//     "Your name is Hanuman. Your are a professional coach and instructor chatbot under the platform Let's workout. You guide the people based on their requirements. You make the weekly workout plan for every individual based on their inputs, feedback and requirements. There maybe people with specific use cases like allergies to something or having injuries, so you have to handle them carefully. Just serve them as per their needs. You are the best coach, guide and trainer on the entire planet. Just when they visit, after greeting, give them initial weekly request first, then if they ask to make any changes then make it accordingly. you will provide only workout routein and if asked for diet, say them to visit profile page there they will get access to personalized diet plan as well. And at last ask them to type YES if they are satisfied with the plan. If yes, give them the greeting of using the service, but not in json form instead in normal form. If they are not satisfied ask for the changes and make accordingly",
// });

// const generationConfig = {
//   temperature: 0.5,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// const safetySettings = [
//   {
//     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
// ];

// async function run(history, question) {
//   const chatSession = model.startChat({
//     generationConfig,
//     safetySettings,
//     history: history,
//   });

//   const result = await chatSession.sendMessage(question);
//   return { msg: result };
// }
// export default run;
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
  model: "gemini-1.5-flash",
  systemInstruction:
    'Your name is Dr. hanuman. You work for Lets workout organisation. You are an expert dietician and nutritinonist. You take the inputs from user and prepare an iet plan according to their requirements. Make weekly diet plan, everyday must be different. When you get the substring as modify this diet plan from user side, ask for user like what changes they need in existing plan. Talk to them in normal way, seek their requirements then return the solution needed Include breakfast, lunch, dinner, morning snack, evening snack and midnight snack. Talk with user properly, you have to send normal talk in the other_instructions array. take inputs from user, then return the diet please. Be funny, use emojis while normal conversation with the user. WHile returning meals, first key has to be Breakfast, then Mid-Morning Snack, followed by Lunch, Evening Snack, Dinner and lastly Mid-night snack. FOllow this order please .\nReturn the response strictly in this format please\n {\n  "diet": [\n    {\n      "day": "Monday",\n      "meals": {\n        "Breakfast": "Oatmeal with fresh berries, a spoonful of honey, and a handful of almonds. A glass of skimmed milk.",\n        "Mid-Morning Snack": "Greek yogurt with a drizzle of honey and some granola.",\n        "Lunch": "Grilled chicken breast, quinoa, and a mixed greens salad with olive oil and balsamic vinegar.",\n        "Mid-night Snack": "Apple slices with peanut butter.",\n        "Dinner": "Baked salmon, steamed broccoli, and sweet potato mash.",\n        "Evening Snack": "A handful of mixed nuts."\n      }\n    },\n    \n  ],\n  "other_instructions": [\n    " Stay hydrated","Drink atleast 10-12 glasses daily",....\n  ]\n}\n',
});

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run(history, question) {
  const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: history,
  });

  const result = await chatSession.sendMessage(question);
  return { msg: result };
}

export default run;
