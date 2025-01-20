import React, { useState, useEffect, useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { Link } from "react-router-dom";
import "../../utilities.css";
import "./Skeleton.css";
import { UserContext } from "../App";

const Home = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <>
      {userId ? (
        <div>
          <button
            onClick={() => {
              googleLogout();
              handleLogout();
            }}
          >
            Logout
          </button>
          <Link to={"/generate"}>Generate</Link>
          <Link to={"/profile"}>Profile</Link>
        </div>
      ) : (
        <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
      )}
      <h1>Welcome to Decor Hunter :)</h1>
      <h2> The Ultimate Interior Design Assistant!</h2>
    </>
  );
};

export default Home;
