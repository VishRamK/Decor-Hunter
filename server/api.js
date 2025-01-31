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
const fs = require("fs").promises;
const path = require("path");

// import models so we can interact with the database
const User = require("./models/user");
const Story = require("./models/story");
const Comment = require("./models/comment");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure express to handle larger payloads
router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure express to serve static files from the uploads directory
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});


// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// Get all stories
router.get("/stories", (req, res) => {
  Story.find({isGenerated: false}).then((stories) => {
    res.send(stories);
  });
});

router.get("/user-stories", (req, res) => {
  const query = {
    creator_id: req.query.creator_id,
    isGenerated: false,
  };

  Story.find(query)
    .then((stories) => {
      res.send(stories);
    })
    .catch((err) => {
      console.error("Error fetching stories:", err);
      res.status(500).send({ error: "Failed to fetch stories" });
    });
});

// Create a new story
router.post("/story", (req, res) => {
  const newStory = new Story({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
    isGenerated: false,
  });

  newStory.save().then((story) => res.send(story));
});

// Get comments for a story
router.get("/comment", (req, res) => {
  Comment.find({ parent: req.query.parent }).then((comments) => {
    res.send(comments);
  });
});

// Create a new comment
router.post("/comment", (req, res) => {
  const newComment = new Comment({
    creator_id: req.user._id,
    creator_name: req.user.name,
    parent: req.body.parent,
    content: req.body.content,
  });

  newComment.save().then((comment) => res.send(comment));
});

// Find out if a story is saved
router.get("/saved-story", (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (!user.savedStories) {
      res.send(false);
    } else {
      res.send(user.savedStories.includes(req.query.storyId));
    }
  });
});

// Save a story
router.post("/save-story", (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (!user.savedStories) {
      user.savedStories = [];
    }
    if (!user.savedStories.includes(req.body.storyId)) {
      user.savedStories.push(req.body.storyId);
      user.save().then(() => res.send({}));
    } else {
      res.send({});
    }
  });
});

// Unsave a story
router.post("/unsave-story", (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (user.savedStories) {
      user.savedStories = user.savedStories.filter((id) => id !== req.body.storyId);
      user.save().then(() => res.send({}));
    } else {
      res.send({});
    }
  });
});

// Get all saved stories
router.get("/saved-stories", (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (!user.savedStories || user.savedStories.length === 0) {
      res.send([]);
      return;
    }
    Story.find({ _id: { $in: user.savedStories }, isGenerated: false }).then((stories) => {
      res.send(stories);
    });
  });
});

// Save a generated design (using the same story model)
router.post("/save-generated", (req, res) => {
  const newStory = new Story({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
    img_url: req.body.img_url,
    isGenerated: true, // Always true for generated designs
  });

  newStory
    .save()
    .then((story) => res.send(story))
    .catch((err) => {
      console.error("Error saving generated design:", err);
      res.status(500).send({ error: "Failed to save generated design" });
    });
});

// Get user's generated designs
router.get("/generated-designs", (req, res) => {
  Story.find({
    creator_id: req.query.userId,
    isGenerated: true,
  })
    .then((stories) => res.send(stories))
    .catch((err) => {
      console.error("Error fetching generated designs:", err);
      res.status(500).send({ error: "Failed to fetch generated designs" });
    });
});

// anything else falls to this "not found" case

router.get("/user", (req, res) => {
  User.findById(req.query.userid)
    .then((user) => {
      if (user) {
        res.send(user);
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

      // Make 5 separate requests to OpenAI's DALL-E
      const variations = [];
      for (let i = 0; i < 5; i++) {
        try {
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
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
