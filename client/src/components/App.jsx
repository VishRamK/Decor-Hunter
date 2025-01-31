// App.jsx
import React, { useState, useEffect, createContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "../utilities.css";
import { get, post } from "../utilities";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (user._id) {
          // they are registered in the database, and currently logged in.
          setUserId(user._id);
        } else {
          // Not logged in, redirect to login unless already on login page
          if (location.pathname !== "/auth/login") {
            navigate("/auth/login");
          }
        }
      })
      .catch((err) => {
        // Error getting user, redirect to login
        if (location.pathname !== "/auth/login") {
          navigate("/auth/login");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, location.pathname]);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      // After successful login, redirect to home page
      navigate("/");
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout").then(() => {
      navigate("/auth/login");
    });
  };

  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only render the outlet if user is logged in or on login page
  const shouldRenderContent = userId || location.pathname === "/auth/login";

  return (
    <UserContext.Provider value={authContextValue}>
      {shouldRenderContent ? <Outlet /> : null}
    </UserContext.Provider>
  );
};

export default App;
