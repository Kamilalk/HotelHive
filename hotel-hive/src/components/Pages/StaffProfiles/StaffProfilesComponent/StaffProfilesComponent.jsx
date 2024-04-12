import "./StaffProfilesComponent.css";
import React from "react";
import { useHistory } from "react-router-dom";
import { auth, database } from "../../../../firebase"; 
import { doc, getDoc } from "firebase/firestore";

const StaffProfilesComponent = ({ id, name, occupation, email, phone }) => {

  const history = useHistory()

  const currentUser = auth.currentUser;
            
  const userId = currentUser.uid;
  console.log("User ID:", userId);
        
  const handleRoomClick = async () => {
    
    const role = await fetchUserRole(userId);
  
    if (role === 'Manager' || role === 'Supervisor') {
      const staffProfileURL = `/StaffProfiles/staffProfile/${id}`;
      history.push(staffProfileURL);
    } else {
  
      return;
    }
    
  };

  const fetchUserRole = async (userId) => {
    try {
      const userProfileRef = doc(database, 'UserProfiles', userId);
      const userProfileSnapshot = await getDoc(userProfileRef);
      if (userProfileSnapshot.exists()) {
        const userProfileData = userProfileSnapshot.data();
        const userRole = userProfileData.role;
        console.log("User's role:", userRole);
        return userRole;
      } else {
        console.log("User profile not found.");
        return null; 
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null; 
    }
  };
 
  return (
    <div onClick={handleRoomClick}  className="mt-4 p-3 staff-profile-card">
      <div className="d-flex justify-content-between">
        <div className="user-info">
          <p className="name">{name}</p>
          <p className="occupation">{occupation}</p>
        </div>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_142_3953" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="8" y="8" width="34" height="34">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M25.0002 8.33337C20.396 8.33337 16.6668 12.0625 16.6668 16.6667C16.6668 21.2709 20.396 25 25.0002 25C29.6043 25 33.3335 21.2709 33.3335 16.6667C33.3335 12.0625 29.6043 8.33337 25.0002 8.33337ZM29.3752 16.6667C29.3752 14.25 27.4168 12.2917 25.0002 12.2917C22.5835 12.2917 20.6252 14.25 20.6252 16.6667C20.6252 19.0834 22.5835 21.0417 25.0002 21.0417C27.4168 21.0417 29.3752 19.0834 29.3752 16.6667ZM37.7085 35.4167C37.7085 34.0834 31.1877 31.0417 25.0002 31.0417C18.8127 31.0417 12.2918 34.0834 12.2918 35.4167V37.7084H37.7085V35.4167ZM8.3335 35.4167C8.3335 29.875 19.4377 27.0834 25.0002 27.0834C30.5627 27.0834 41.6668 29.875 41.6668 35.4167V39.5834C41.6668 40.7292 40.7293 41.6667 39.5835 41.6667H10.4168C9.271 41.6667 8.3335 40.7292 8.3335 39.5834V35.4167Z" fill="black" />
          </mask>
          <g mask="url(#mask0_142_3953)">
            <rect width="50" height="50" fill="white" />
          </g>
        </svg>
      </div>

      <div className="user-details">
        <p className="email">Email: {email}</p>
        <p className="phone">Phone: {phone}</p>
      </div>
    </div>
  )
}

export default StaffProfilesComponent