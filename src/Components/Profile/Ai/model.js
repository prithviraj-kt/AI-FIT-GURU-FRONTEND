const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");

const apiKey = "AIzaSyDv5Vln4c6BHvz5hcMNdN7PjnMpqqxtFgs";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction:
    'You are an expert nutritinist. Your task will be pretty simple. You will get the image of food item, they can be veg or nonveg. You have to return the amount of calories in it and name of the item in the specific format. There might be multiple food items, so make an array of all the consumable items\n[\n{name:"apple",\nquantity:"",\ncalorie_count:"100",\nother_instructions:""\n}\n]\nJust retuurn the json object, and in calorie field only return a number. If you wan to add any other information, add it to the other_instructions array please.',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run() {
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("idli.jpeg", "image/jpeg"),
    await uploadToGemini("dinner1.jpg", "image/jpeg"),
    await uploadToGemini("dinner.jpg", "image/jpeg"),
  ];

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n[\n{\n"name": "Idli",\n"quantity": "4 pieces",\n"calorie_count": 300,\n"other_instructions": "This is an approximation for 4 medium-sized idlis. Calorie count can vary based on size and ingredients used."\n},\n{\n"name": "Sambar",\n"quantity": "1 cup",\n"calorie_count": 150,\n"other_instructions": "Calorie count is an estimate and can vary based on ingredients and portion size."\n},\n{\n"name": "Coconut Chutney",\n"quantity": "1/4 cup",\n"calorie_count": 100,\n"other_instructions": "This is an estimate. Calorie count can change based on the chutney\'s ingredients and thickness."\n}\n]\n```\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[1].mimeType,
              fileUri: files[1].uri,
            },
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n[\n{\n"name": "Roti",\n"quantity": "2 pieces",\n"calorie_count": 200,\n"other_instructions": "Calorie count is for 2 medium-sized rotis made from whole wheat flour. It can vary depending on size and ingredients."\n},\n{\n"name": "Green Bean and Potato Stir Fry",\n"quantity": "1 cup",\n"calorie_count": 250,\n"other_instructions": "This is an estimate. Calorie count can vary depending on the amount of oil and spices used in cooking."\n},\n{\n"name": "Cucumber",\n"quantity": "1/2 cup, sliced",\n"calorie_count": 10,\n"other_instructions": "Cucumbers are low in calories and hydrating."\n},\n{\n"name": "Raita",\n"quantity": "1/2 cup",\n"calorie_count": 100,\n"other_instructions": "This is an estimate as calorie count can vary based on the type of yogurt and the amount of additional ingredients used."\n}\n]\n```',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[2].mimeType,
              fileUri: files[2].uri,
            },
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n[\n{\n"name": "Roti",\n"quantity": "1",\n"calorie_count": 150,\n"other_instructions": "Calorie count is for one large roti. It can vary depending on size and ingredients."\n},\n{\n"name": "Chicken Curry",\n"quantity": "1 cup",\n"calorie_count": 350,\n"other_instructions": "This is an estimate.  Calorie count can vary depending on the recipe and ingredients used."\n},\n{\n"name": "Rice",\n"quantity": "1/2 cup, cooked",\n"calorie_count": 100,\n"other_instructions": "Calorie count is for plain white rice."\n},\n{\n"name": "Chana Masala",\n"quantity": "1/2 cup",\n"calorie_count": 200,\n"other_instructions": "This is an estimate. Calorie count can vary depending on the recipe."\n},\n{\n"name": "Salad",\n"quantity": "1/2 cup",\n"calorie_count": 50,\n"other_instructions": "This is an estimate as calorie count can vary depending on the type and amount of vegetables used."\n}\n]\n```',
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  return { msg: result };
}

export default run;
