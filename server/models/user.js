const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  savedStories: [String], // Array of story IDs
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
