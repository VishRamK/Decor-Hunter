import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Home from "./components/pages/Home";
import NotFound from "./components/pages/NotFound";
import Generate from "./components/pages/Generate";
import Profile from "./components/pages/Profile";
import Feed from "./components/pages/Feed";
import Settings from "./components/pages/Settings";
import Login from "./components/pages/Login";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";
//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "810058481388-4ktsfiejrdj8ptig1tl3udo04ta3a2v6.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/generate" element={<Generate />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/settings" element={<Settings />} />
      {/* Catch any unknown routes and redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
