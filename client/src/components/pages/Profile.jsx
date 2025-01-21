import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [archivedImages, setArchivedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user's posts and archived images from an API
    const fetchProfileData = async () => {
      try {
        // Replace these URLs with your actual API endpoints
        const postsResponse = await fetch("/api/user/posts");
        const imagesResponse = await fetch("/api/user/archived-images");

        const postsData = await postsResponse.json();
        const imagesData = await imagesResponse.json();

        setPosts(postsData);
        setArchivedImages(imagesData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="profile-page">
      <Link to={"/"}>Home</Link>
      <h1>Your Profile</h1>
      <Link to="/settings" className="settings-link">
        Go to Settings
      </Link>

      {isLoading ? (
        <p>Loading your profile...</p>
      ) : (
        <div>
          <section className="posts-section">
            <h2>Your Posts</h2>
            {posts.length > 0 ? (
              <ul>
                {posts.map((post) => (
                  <li key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No posts found.</p>
            )}
          </section>

          <section className="images-section">
            <h2>Archived Images</h2>
            {archivedImages.length > 0 ? (
              <div className="image-gallery">
                {archivedImages.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.description || "Archived image"}
                    className="archived-image"
                  />
                ))}
              </div>
            ) : (
              <p>No archived images found.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
