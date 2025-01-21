import React, { useState, useEffect, useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { Link } from "react-router-dom";
import "../../utilities.css";
import "./Home.css";
import { UserContext } from "../App";

const Home = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <div className="home-container">
      <h1>Welcome to Decor Hunter :)</h1>
      <h2>The Ultimate Interior Design Assistant!</h2>

      {userId ? (
        <div className="home-logged-in">
          <div className="nav-links">
            <Link to="/generate" className="nav-link">
              Generate
            </Link>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </div>
          <button
            className="logout-button"
            onClick={() => {
              googleLogout();
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="home-logged-out">
          <p>Please log in to start designing your perfect space!</p>
          <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
        </div>
      )}
    </div>
  );
};

export default Home;
