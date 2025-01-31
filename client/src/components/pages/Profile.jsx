import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import "./Profile.css";
import { UserContext } from "../App";
import { get } from "../../utilities";
import SingleStory from "../modules/SingleStory";

const Profile = () => {
  const { userId: loggedInUserId } = useContext(UserContext); // Current logged-in user
  const { userId: profileUserId } = useParams(); // Extract userId from the URL
  const [posts, setPosts] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {

        const userData = await get("/api/user", { userid: profileUserId });

        // Get regular posts (not generated)
        const userPosts = await get("/api/user-stories", {
          creator_id: profileUserId,
          isGenerated: false,
        });

        // Get all stories and filter for generated ones
        const allStories = await get("/api/user-stories", { creator_id: profileUserId });
        const generatedOnes = allStories.filter((story) => story.isGenerated);

        setUser(userData);
        setPosts(userPosts);
        setGeneratedDesigns(generatedOnes);

        if (loggedInUserId === profileUserId) {
          // Get saved stories
          const savedStoriesResponse = await get("/api/saved-stories");
          const savedRegular = savedStoriesResponse.filter((story) => !story.isGenerated);
          const savedGenerated = savedStoriesResponse.filter((story) => story.isGenerated);

          setSavedStories({
            regular: savedRegular,
            generated: savedGenerated,
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [profileUserId, loggedInUserId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Link to={"/"}>Home</Link>
        <h1>User not found</h1>
        <p>Debug info: Looking for user ID: {profileUserId}</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Link to={"/"}>Home</Link>
      <h1>{user.name}'s Profile</h1>
      {loggedInUserId === profileUserId && (
        <Link to="/settings" className="settings-link">
          Go to Settings
        </Link>
      )}
      <section className="generated-designs-section">
        <h2>Saved Generated Designs</h2>
        {generatedDesigns.length > 0 ? (
          <div className="designs-grid">
            {generatedDesigns.map((design) => (
              <SingleStory
                key={design._id}
                _id={design._id}
                creator_id={design.creator_id}
                creator_name={design.creator_name}
                content={design.content}
                img_url={design.img_url}
              />
            ))}
          </div>
        ) : (
          <p>No generated designs yet.</p>
        )}
      </section>
      <section className="posts-section">
        <h2>Posts</h2>
        {posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <SingleStory
                key={post._id}
                _id={post._id}
                creator_id={post.creator_id}
                creator_name={post.creator_name}
                content={post.content}
                img_url={post.img_url}
              />
            ))}
          </div>
        ) : (
          <p>No posts found.</p>
        )}
      </section>
      {loggedInUserId === profileUserId && (
        <>
          <section className="saved-stories-section">
            <h2>Saved Posts</h2>
            {savedStories.regular && savedStories.regular.length > 0 ? (
              <div>
                {savedStories.regular.map((story) => (
                  <SingleStory
                    key={story._id}
                    _id={story._id}
                    creator_id={story.creator_id}
                    creator_name={story.creator_name}
                    content={story.content}
                    img_url={story.img_url}
                  />
                ))}
              </div>
            ) : (
              <p>No saved posts yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Profile;
