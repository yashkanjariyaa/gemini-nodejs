// controller.js
require("dotenv").config();
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(req, res) {
  try {
    const prompt = req.query.prompt || " ";
    if (prompt) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream(prompt);
      const response = await result.response;
      const text = response.text();
      res.status(200).json({ message: text });
      console.log(text);
    } else {
      res.status(400).json({ error: "No prompt provided" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function runMultiModal(req, res) {
  try {
    // For text-and-image input (multimodal), use the gemini-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = "What's different between these pictures?";

    const imageParts = [
      fileToGenerativePart("./image/got.jpeg", "image/jpeg"),
      fileToGenerativePart("./image/pj.jpeg", "image/jpeg"),
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(200).json({ message: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function runChat(req, res) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "Hello, I have 2 dogs in my house.",
        },
        {
          role: "model",
          parts: "Great to meet you. What would you like to know?",
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const msg = req.query.msg;
    if (msg) {
      const result = await model.generateContentStream(msg);
      const response = await result.response;
      const text = response.text();
      console.log(text);
      res.status(200).json({ message: text });
    } else {
      res.status(400).json({ error: "No prompt provided" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function runEmbedding(req, res) {
  try {
    const text = req.query.text;
    if (req.query.text) {
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      console.log(embedding.values);
      res.status(200).json({ message: text });
    } else {
      res.status(400).json({ error: "No prompt provided" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function runTextParameters(req, res) {
  try {
    let flag = true;
    const generationConfig = {
      stopSequences: [req.query.stopSequences],
      maxOutputTokens: req.query.maxOutputTokens,
      temperature: req.query.temperature,
      topP: req.query.topP,
      topK: req.query.topK,
    };
    const keys = Object.keys(generationConfig);
    // Iterate through all keys
    for (let key of keys) {
      // Check if the value corresponding to the key is missing or falsy
      if (!generationConfig[key]) {
        flag = false; // If any value is missing, return false
      }
    }
    if(flag === false){
      res.status(400).json({ error: "Missing model parameters" });
    }
    const prompt = req.query.text;
    if(prompt && flag){
      const model = genAI.getGenerativeModel({ model: "gemini-pro",  generationConfig });
      const result = await model.generateContentStream(prompt);
      const response = await result.response;
      const text = response.text();
      res.status(200).json({ message: text });
      console.log(text);
    }else{
      res.status(400).json({ error: "No prompt provided" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { run, runMultiModal, runChat, runEmbedding, runTextParameters };
