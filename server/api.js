/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const OpenAI = require("openai");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs").promises;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased to 50MB to handle initial upload
  },
  fileFilter: (req, file, cb) => {
    console.log("Received file:", {
      name: file.originalname,
      type: file.mimetype,
      size: file.size / 1024 + "KB",
    });

    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG files are allowed"));
    }
  },
}).single("image");

// import models so we can interact with the database
const User = require("./models/user");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure express to handle larger payloads
router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ extended: true, limit: "50mb" }));

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case

router.get("/user", (req, res) => {
  User.findById(req.query.userid)
    .then((user) => {
      if (user) {
        res.send({ name: user.name }); // Ensure name is part of the response
      } else {
        res.status(404).send({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    });
});

router.post("/generate-variations", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        error: "File upload error",
        details: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const { textInput, prompt } = req.body;

      // Construct a detailed prompt combining room description and style
      const detailedPrompt = `Generate an interior design image of a ${textInput} in ${prompt} style. The room should maintain the basic layout and architectural features but transform the design elements according to the specified style.`;

      console.log("Using prompt:", detailedPrompt);

      // Make 5 separate requests to OpenAI's DALL-E
      const variations = [];
      for (let i = 0; i < 5; i++) {
        try {
          console.log(`Starting DALL-E request ${i + 1}`);
          const response = await openai.images.generate({
            model: "dall-e-3", // Using DALL-E 3 for better quality
            prompt: detailedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural",
          });

          if (!response.data || !response.data[0] || !response.data[0].url) {
            console.error(`Invalid response for generation ${i + 1}:`, response);
            throw new Error("Invalid response from OpenAI API");
          }

          variations.push({
            image: response.data[0].url,
            title: `Design ${i + 1}`,
            description: `${textInput} styled with ${prompt}`,
          });
          console.log(`Successfully generated design ${i + 1}`);

          // Add a small delay between requests to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (generationError) {
          console.error(`OpenAI API error in generation ${i + 1}:`, {
            message: generationError.message,
            response: generationError.response?.data,
            status: generationError.response?.status,
          });

          if (generationError.response?.data?.error) {
            throw new Error(`OpenAI API error: ${generationError.response.data.error.message}`);
          }

          throw generationError;
        }
      }

      res.json({ variations });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({
        error: "Failed to generate variations",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });
});

router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
