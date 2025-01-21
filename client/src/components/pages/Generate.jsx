import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Generate.css";

const Generate = () => {
  const [textInput, setTextInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedCards, setGeneratedCards] = useState([]);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission (e.g., send data to parent component or API)
    console.log("Text Input:", textInput);
    console.log("Image:", image);

    try {
      // Simulated API call to process image and get card data
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: JSON.stringify({ image: imagePreview, text: textInput }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const cardData = await response.json();
      setGeneratedCards(cardData);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleDownload = () => {
    if (imagePreview) {
      const link = document.createElement("a");
      link.href = imagePreview;
      link.download = "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="generate-container">
      <Link to={"/"}>Home</Link>
      <h2>Generate</h2>
      <form className="generate-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="textInput">Text Input:</label>
          <input
            type="text"
            id="textInput"
            value={textInput}
            onChange={handleTextChange}
            className="generate-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageInput">Image Input:</label>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
            className="generate-input"
          />
        </div>
        <button type="submit" className="generate-button">
          Submit
        </button>
      </form>

      {imagePreview && (
        <div className="image-preview">
          <h3>Generated Images:</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              padding: "0 20px",
            }}
          >
            {[...Array(5)].map((_, index) => (
              <img
                key={index}
                src={imagePreview}
                alt={`Generated preview ${index + 1}`}
                className="generated-image"
              />
            ))}
          </div>
          <button onClick={handleDownload} className="generate-button">
            Download Image
          </button>
        </div>
      )}

      {generatedCards.length > 0 && (
        <div className="generated-cards">
          <h3>Generated Cards:</h3>
          <div
            className="cards-container"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {generatedCards.map((card, index) => (
              <div
                key={index}
                className="card"
                style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
              >
                <img
                  src={card.image}
                  alt={`Card ${index + 1}`}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
                <p>
                  <strong>{card.title}</strong>
                </p>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;
