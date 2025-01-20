import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
  const [membershipInfo, setMembershipInfo] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user settings and membership details from an API
    const fetchSettingsData = async () => {
      try {
        // Replace these URLs with your actual API endpoints
        const membershipResponse = await fetch("/api/user/membership");
        const userDetailsResponse = await fetch("/api/user/details");

        const membershipData = await membershipResponse.json();
        const userDetailsData = await userDetailsResponse.json();

        setMembershipInfo(membershipData);
        setUserDetails(userDetailsData);
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  return (
    <div className="settings-page">
      <Link to={"/"}>Home</Link>
      <h1>Settings</h1>

      {isLoading ? (
        <p>Loading your settings...</p>
      ) : (
        <div>
          <section className="membership-section">
            <h2>Membership Information</h2>
            <p>
              <strong>Membership Level:</strong> {membershipInfo.level || "Free"}
            </p>
            <p>
              <strong>Expiration Date:</strong> {membershipInfo.expirationDate || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {membershipInfo.status || "Active"}
            </p>
          </section>

          <section className="user-details-section">
            <h2>User Details</h2>
            <p>
              <strong>Name:</strong> {userDetails.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {userDetails.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {userDetails.phone || "N/A"}
            </p>
          </section>

          <section className="actions-section">
            <h2>Actions</h2>
            <button onClick={() => console.log("Edit Profile clicked")}>Edit Profile</button>
            <button onClick={() => console.log("Change Password clicked")}>Change Password</button>
            <button onClick={() => console.log("Upgrade Membership clicked")}>
              Upgrade Membership
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Settings;
