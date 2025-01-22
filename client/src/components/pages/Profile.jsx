import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import "./Profile.css";
import { UserContext } from "../App";
import { get, post } from "../../utilities";

const Profile = () => {
  const { userId } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [archivedImages, setArchivedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    // Only fetch data if there is a logged in user
    if (!userId) {
      setIsLoading(false);
      return;
    }
    console.log("userId:", userId);

    const fetchProfileData = async () => {
      try {
        const userData = await get(`/api/user`, { userid: userId });
        console.log("User data:", userData);
        if (userData && userData.name) {
          setUserName(userData.name);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="profile-page">
        <Link to={"/"}>Home</Link>
        <h1>Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Link to={"/"}>Home</Link>
      <h1>{userName}'s Profile</h1>
      <Link to="/settings" className="settings-link">
        Go to Settings
      </Link>

      {isLoading ? (
        <p>Loading your profile...</p>
      ) : (
        <div>
          <section className="posts-section">
            <h2>Your Posts</h2>
            {
              /*posts.length > 0 ? (
              <ul>
                {posts.map((post) => (
                  <li key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                  </li>
                ))}
              </ul>
            ) : */ <p>No posts found.</p>
            }
          </section>

          <section className="images-section">
            <h2>Archived Images</h2>
            {
              /*archivedImages.length > 0 ? (
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
            ) : */ <p>No archived images found.</p>
            }
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
