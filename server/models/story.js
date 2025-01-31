const mongoose = require("mongoose");

//define a story schema for the database
const StorySchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  content: String,
  img_url: { type: String, required: false }, // Only used for generated images
  isGenerated: { type: Boolean, default: false },
});

// compile model from schema
module.exports = mongoose.model("story", StorySchema);
