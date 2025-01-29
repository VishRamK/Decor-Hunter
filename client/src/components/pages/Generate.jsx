import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./Generate.css";
import { UserContext } from "../App";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB limit

const Generate = () => {
  const [textInput, setTextInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useContext(UserContext);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Ultra aggressive resizing - limit to 128px
          if (width > height) {
            if (width > 128) {
              height = Math.round((height * 128) / width);
              width = 128;
            }
          } else {
            if (height > 128) {
              width = Math.round((width * 128) / height);
              height = 128;
            }
          }

          console.log(`Resizing image to ${width}x${height}`);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              console.log("Original size:", file.size / 1024 / 1024, "MB");
              console.log("Compressed size:", compressedFile.size / 1024 / 1024, "MB");
              resolve(compressedFile);
            },
            "image/jpeg",
            0.1 // Ultra aggressive compression quality
          );
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected file size:", file.size / 1024 / 1024, "MB");

    try {
      // Always compress the image regardless of size
      const compressedFile = await compressImage(file);
      if (compressedFile.size > MAX_IMAGE_SIZE) {
        alert(
          "Image is still too large after compression. Please choose a smaller image (max 4MB)."
        );
        return;
      }
      setImage(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try a different image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!image) {
        alert("Please select an image first");
        setLoading(false);
        return;
      }

      // Double compression before submission
      let compressedImage = await compressImage(image);
      if (compressedImage.size > 1024 * 1024) {
        compressedImage = await compressImage(compressedImage);
      }

      console.log("Final submission size:", compressedImage.size / 1024 / 1024, "MB");

      const formData = new FormData();
      formData.append("image", compressedImage);
      formData.append("prompt", prompt);
      formData.append("textInput", textInput);

      try {
        console.log("Sending request to server...");
        const response = await fetch("/api/generate-variations", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
          // Add timeout and credentials
          credentials: "same-origin",
          timeout: 300000, // 5 minute timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          throw new Error(`Server error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("Received response:", data);

        if (data.variations && data.variations.length > 0) {
          setGeneratedCards(data.variations);
        } else {
          throw new Error("No variations received from the server");
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out - please try again");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error generating variations:", error);
      alert(`Error: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (card) => {
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        body: JSON.stringify({
          content: card.description,
          img_url: card.image,
          isGenerated: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save design");
      }

      alert("Design saved successfully!");
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Failed to save design. Please try again.");
    }
  };

  return (
    <>
      {userId && (
        <div className="generate-container">
          <Link to={"/"}>Home</Link>
          <h2>Generate</h2>
          <form className="generate-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="textInput">Room Description:</label>
              <input
                type="text"
                id="textInput"
                value={textInput}
                onChange={handleTextChange}
                placeholder="Describe your room (e.g., living room, bedroom)"
                className="generate-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="prompt">Style Prompt:</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the style you want (e.g., modern minimalist, bohemian, industrial)"
                className="generate-input"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label htmlFor="imageInput">Upload Room Image:</label>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="generate-input"
              />
            </div>
            <button type="submit" className="generate-button" disabled={loading}>
              {loading ? "Generating..." : "Generate Variations"}
            </button>
          </form>

          {generatedCards.length > 0 && (
            <div className="generated-cards">
              <h3>Generated Designs</h3>
              <div className="cards-grid">
                {generatedCards.map((card, index) => (
                  <div key={index} className="design-card">
                    <div className="image-container">
                      <img
                        src={card.image}
                        alt={`Generated design ${index + 1}`}
                        className="design-image"
                      />
                    </div>
                    <div className="card-content">
                      <h4>{card.title}</h4>
                      <p>{card.description}</p>
                      <button onClick={() => handleSave(card)} className="save-button">
                        Save to Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Generate;
