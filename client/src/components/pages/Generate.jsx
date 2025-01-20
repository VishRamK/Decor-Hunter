import React, { useState } from "react";
import { Link } from "react-router-dom";
const Generate = () => {
  const [textInput, setTextInput] = useState("");
  const [image, setImage] = useState(null);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., send data to parent component or API)
    console.log("Text Input:", textInput);
    console.log("Image:", image);
  };

  return (
    <div className="generate-component">
      <Link to={"/"}>Home</Link>
      <h2>Generate</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="textInput">Text Input:</label>
          <input type="text" id="textInput" value={textInput} onChange={handleTextChange} />
        </div>
        <div className="form-group">
          <label htmlFor="imageInput">Image Input:</label>
          <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Generate;
