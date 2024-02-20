// index.js
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;
const controller = require("../controllers/controller.js");

app.get("/api/prompt", (req, res) => {
  controller.run(req, res);
});

app.get("/api/image_text_prompt", (req, res) => {
  controller.runMultiModal(req, res);
});

app.get("/api/chat_prompt", (req, res) => {
  controller.runChat(req, res);
});

app.get("/api/embedding_prompt", (req, res) => {
  controller.runEmbedding(req, res);
});

app.get("/api/model_parameters_prompt", (req, res) => {
  controller.runTextParameters(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
