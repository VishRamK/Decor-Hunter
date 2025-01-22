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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Profile User ID from params:", profileUserId); // Debug log
    console.log("Logged in User ID:", loggedInUserId); // Debug log

    const fetchProfileData = async () => {
      try {
        const userData = await get("/api/user", { userid: profileUserId });
        console.log("Fetched user data:", userData); // Debug log

        const userPosts = await get("/api/stories", { creator_id: profileUserId });
        console.log("Fetched user posts:", userPosts); // Debug log

        const savedStoriesData =
          loggedInUserId === profileUserId ? await get("/api/saved-stories") : [];

        setUser(userData);
        setPosts(userPosts);
        setSavedStories(savedStoriesData);
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
        <section className="saved-stories-section">
          <h2>Saved Stories</h2>
          {savedStories.length > 0 ? (
            <div>
              {savedStories.map((story) => (
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
            <p>No saved stories found.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default Profile;
