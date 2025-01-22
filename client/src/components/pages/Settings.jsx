import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "./Settings.css";
import { UserContext } from "../App";
import { get, post } from "../../utilities";

const Settings = () => {
  const { userId } = useContext(UserContext);
  const [membershipInfo, setMembershipInfo] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if there is a logged in user
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchSettingsData = async () => {
      try {
        // Add userId to API requests to get specific user's data
        //const userData = await get(`/api/user`, { userid: userId });
        //const membershipResponse = await fetch(`/api/user/${userId}/membership`);
        const userData = await get(`/api/user`, { userid: userId });

        //const membershipData = await membershipResponse.json();
        //const userDetailsData = await userDetailsResponse.json();
        if (userData && userData.name) {
          // Update userDetails with userData information
          setUserDetails({
            name: userData.name,
            //email: userData.email,
            //phone: userData.phone,
          });
        }
        setMembershipInfo(membershipData);
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="settings-page">
        <Link to={"/"}>Home</Link>
        <h1>Please log in to view your settings</h1>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div style={{ textAlign: "center", width: "100%" }}>
        <Link to={"/"}>Home</Link>
      </div>
      <h1>{userDetails.name}'s Settings</h1>
      {isLoading ? (
        <p>Loading your settings...</p>
      ) : (
        <div>
          <section className="settings-section">
            <h2>Membership Information</h2>
            <p>
              <strong>Membership Level:</strong> {"Free"}
            </p>
            <p>
              <strong>Expiration Date:</strong> {"N/A"}
            </p>
            <p>
              <strong>Status:</strong> {"Active"}
            </p>
          </section>

          <section className="settings-section">
            <h2>Details</h2>
            <p>
              <strong>Name:</strong> {userDetails.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {"N/A" /*userDetails.email || "N/A"*/}
            </p>
            <p>
              <strong>Phone:</strong> {"N/A" /*userDetails.phone || "N/A"*/}
            </p>
          </section>

          <section className="settings-section">
            <h2>Account Actions</h2>
            <button className="settings-button" onClick={() => console.log("Edit Profile clicked")}>
              Edit Your Profile
            </button>
            <button
              className="settings-button"
              onClick={() => console.log("Change Password clicked")}
            >
              Change Your Password
            </button>
            <button
              className="settings-button"
              onClick={() => console.log("Upgrade Membership clicked")}
            >
              Upgrade Your Membership
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Settings;
