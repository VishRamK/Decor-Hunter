import React, { useContext } from "react";
import { UserContext } from "../App";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const Login = () => {
  const { handleLogin } = useContext(UserContext);

  return (
    <div className="Login-container">
      <h1>Welcome to Decor Hunter</h1>
      <div className="Login-google">
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
};

export default Login;