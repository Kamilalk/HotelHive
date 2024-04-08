import "./Dashboard.css";
import React, { useEffect, useState } from 'react'
import '../../../css/style.css'
import { Link, useHistory } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import image from "../../../assets/images/hexagon.png";
import RoomAssignment from './../RoomAssignments/RoomAssignments';
import NotificationComponent from './DashboardComponent/NotificationComponent';
import {  getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { database } from '../../../firebase';


export default function Dashboard() {
  const history = useHistory()
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get the Firebase Auth instance
    const auth = getAuth();

    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserId(user.uid);
      } else {
        // User is signed out
        setUserId(null);
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch notifications when the component mounts
    fetchNotifications()  // Replace 'userId' with the actual user ID
      .then((notifications) => {
        setNotifications(notifications);
        console.log('Notifications state:', notifications);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
      });
  }, []);

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('User not authenticated');
        return []; // Return empty array if user is not authenticated
      }
      const userid = user.uid;
      const userDocRef = doc(database, 'UserProfiles', userid);
      const notificationsQuery = query(collection(userDocRef, 'notifications'));
      const notificationsSnapshot = await getDocs(notificationsQuery);
  
      const notifications = [];
      notificationsSnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      console.log('Fetched notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return []; // Return an empty array in case of error
    }
  };


  

  return (
    <>
      {/* New Dashboard Design  */}
      <div className="dashboard-container">
        <div className="row">
          {/* <div className="col-lg-2 col-md-2 col-sm-12"></div> */}
          <div className="col-lg-4 col-md-4 col-sm-6 notification-center-section">
            <div className="notification-center">
              <p className="title">Notification <br /> Center</p>
              <div className="notification-content">
                {notifications
                  .sort((a, b) => new Date(b.time + " " + b.date) - new Date(a.time + " " + a.date))
                  .map((notification) => (
                    <NotificationComponent
                      key={notification.id}
                      id={notification.id}
                      type={notification.type}
                      title={notification.title}
                      message={notification.message}
                      description={notification.description}
                      time={notification.time}
                      date={notification.date}
                      info={notification.info}
                      
                    />
                  ))}
              </div>
            </div>


          </div>
          <div className="col-lg-8 col-md-8 col-sm-6 hexagon-links-container">
            <div className="image-cont-1">
              <div className="image-container">
                <img className="profile-image" src={require("../../../assets/images/profile.png")} alt="profile" />
                <Link to={`/StaffProfiles/staffProfile/${userId}`} className="profile-link">My Profile</Link>
                <img src={image} alt="img" />
              </div>
              <div className="roaster-image-container">
                <svg className="roaster-image" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_7_271" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="3" y="2" width="18" height="20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.82 4H19C20.1 4 21 4.9 21 6V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V6C3 4.9 3.9 4 5 4H9.18C9.6 2.84 10.7 2 12 2C13.3 2 14.4 2.84 14.82 4ZM13 5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5ZM12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8ZM6 18.6V20H18V18.6C18 16.6 14 15.5 12 15.5C10 15.5 6 16.6 6 18.6Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_7_271)">
                    <rect width="24" height="24" fill="#D969DC" />
                  </g>
                </svg>
                <Link to="/managerPages/Roster" className="roaster-link">Roaster</Link>
                <img src={image} alt="img" />
              </div>
              <div className="staff-image-container">
                <svg className="staff-image" width="31" height="27" viewBox="0 0 31 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_7_303" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="1" y="5" width="29" height="17">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.1955 9C14.1955 10.8675 12.4776 12.375 10.3334 12.375C8.18925 12.375 6.45842 10.8675 6.45842 9C6.45842 7.1325 8.18925 5.625 10.3334 5.625C12.4776 5.625 14.1955 7.1325 14.1955 9ZM24.5288 9C24.5288 10.8675 22.8109 12.375 20.6667 12.375C18.5226 12.375 16.7917 10.8675 16.7917 9C16.7917 7.1325 18.5226 5.625 20.6667 5.625C22.8109 5.625 24.5288 7.1325 24.5288 9ZM10.3334 14.625C7.32383 14.625 1.29175 15.9412 1.29175 18.5625V20.25C1.29175 20.8687 1.873 21.375 2.58341 21.375H18.0834C18.7938 21.375 19.3751 20.8687 19.3751 20.25V18.5625C19.3751 15.9412 13.343 14.625 10.3334 14.625ZM19.4138 14.6812C19.8659 14.6475 20.2922 14.625 20.6667 14.625C23.6763 14.625 29.7084 15.9412 29.7084 18.5625V20.25C29.7084 20.8687 29.1272 21.375 28.4167 21.375H21.7259C21.868 21.0262 21.9584 20.6438 21.9584 20.25V18.5625C21.9584 16.9087 20.938 15.66 19.4655 14.7262C19.4616 14.7228 19.4577 14.7184 19.4534 14.7136C19.4436 14.7024 19.4318 14.6891 19.4138 14.6812Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_7_303)">
                    <rect width="31" height="27" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/managerPages/StaffProfiles" className="staff-link">Staff Profile</Link>
                <img src={image} alt="img" />
              </div>
            </div>

            <div className="image-cont-2">
              <div className="image-container">
                <svg className="room-assignments-image" width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_7_283" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="3" y="2" width="18" height="26">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19 5H14.82C14.4 3.55 13.3 2.5 12 2.5C10.7 2.5 9.6 3.55 9.18 5H5C3.9 5 3 6.125 3 7.5V25C3 26.375 3.9 27.5 5 27.5H19C20.1 27.5 21 26.375 21 25V7.5C21 6.125 20.1 5 19 5ZM12 5C12.55 5 13 5.5625 13 6.25C13 6.9375 12.55 7.5 12 7.5C11.45 7.5 11 6.9375 11 6.25C11 5.5625 11.45 5 12 5ZM8 22.5H13C13.55 22.5 14 21.9375 14 21.25C14 20.5625 13.55 20 13 20H8C7.45 20 7 20.5625 7 21.25C7 21.9375 7.45 22.5 8 22.5ZM16 17.5H8C7.45 17.5 7 16.9375 7 16.25C7 15.5625 7.45 15 8 15H16C16.55 15 17 15.5625 17 16.25C17 16.9375 16.55 17.5 16 17.5ZM8 12.5H16C16.55 12.5 17 11.9375 17 11.25C17 10.5625 16.55 10 16 10H8C7.45 10 7 10.5625 7 11.25C7 11.9375 7.45 12.5 8 12.5Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_7_283)">
                    <rect width="24" height="30" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/managerPages/RoomAssignments" className="room-assignments-link">Room Assignments</Link>
                <img src={image} alt="img" />
              </div>
              <div className="chats-image-container">
                <svg className="chats-image" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_7_345" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4 2H20C21.1 2 22 2.9 22 4V16C22 17.1 21.1 18 20 18H6L2 22L2.01 4C2.01 2.9 2.9 2 4 2ZM17 9H7C6.45 9 6 9.45 6 10C6 10.55 6.45 11 7 11H17C17.55 11 18 10.55 18 10C18 9.45 17.55 9 17 9ZM13 14H7C6.45 14 6 13.55 6 13C6 12.45 6.45 12 7 12H13C13.55 12 14 12.45 14 13C14 13.55 13.55 14 13 14ZM7 8H17C17.55 8 18 7.55 18 7C18 6.45 17.55 6 17 6H7C6.45 6 6 6.45 6 7C6 7.55 6.45 8 7 8Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_7_345)">
                    <rect width="24" height="24" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/chats" className="chats-link">Chats</Link>
                <img src={image} alt="img" />
              </div>
            </div>

            <div className="image-cont-3">
              <div className="image-container">
                <svg className="room-profiles-image" width="33" height="28" viewBox="0 0 33 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_7_363" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="1" y="8" width="31" height="12">
                    <path fillRule="evenodd" clipRule="evenodd" d="M17.875 8.16669H26.125C29.1637 8.16669 31.625 10.255 31.625 12.8334V17.5C31.625 18.7834 30.3875 19.8334 28.875 19.8334H4.125C2.6125 19.8334 1.375 18.7834 1.375 17.5V9.33335C1.375 8.69169 1.99375 8.16669 2.75 8.16669C3.50625 8.16669 4.125 8.69169 4.125 9.33335V16.3334H15.125V10.5C15.125 9.21669 16.3625 8.16669 17.875 8.16669ZM13.75 11.6667C13.75 13.5917 11.8938 15.1667 9.625 15.1667C7.35625 15.1667 5.5 13.5917 5.5 11.6667C5.5 9.74169 7.35625 8.16669 9.625 8.16669C11.8938 8.16669 13.75 9.74169 13.75 11.6667Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_7_363)">
                    <rect width="33" height="28" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/managerPages/RoomProfiles" className="room-profiles-link">Room Profiles</Link>
                <img src={image} alt="img" />
              </div>
              <div className="training-image-container">
                <svg className="training-mode-image" width="37" height="33" viewBox="0 0 37 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_9_380" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="2" width="29" height="29">
                    <path fillRule="evenodd" clipRule="evenodd" d="M29.2917 5.5H27.75V4.125C27.75 3.36875 27.0562 2.75 26.2083 2.75C25.3604 2.75 24.6667 3.36875 24.6667 4.125V5.5H12.3333V4.125C12.3333 3.36875 11.6396 2.75 10.7917 2.75C9.94375 2.75 9.25 3.36875 9.25 4.125V5.5H7.70833C5.99708 5.5 4.64042 6.7375 4.64042 8.25L4.625 27.5C4.625 29.0125 5.99708 30.25 7.70833 30.25H29.2917C30.9875 30.25 32.375 29.0125 32.375 27.5V8.25C32.375 6.7375 30.9875 5.5 29.2917 5.5ZM24.6667 15.8538C24.2196 15.455 23.4796 15.455 23.0325 15.8538L16.3263 21.835L13.875 19.6488C13.4279 19.25 12.6879 19.25 12.2408 19.6488C11.7937 20.0475 11.7937 20.7075 12.2408 21.1063L15.2317 23.7738C15.8329 24.31 16.8042 24.31 17.4054 23.7738L24.6513 17.3112C25.1138 16.9125 25.1138 16.2525 24.6667 15.8538ZM9.25 27.5H27.75C28.5979 27.5 29.2917 26.8813 29.2917 26.125V12.375H7.70833V26.125C7.70833 26.8813 8.40208 27.5 9.25 27.5Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_9_380)">
                    <rect width="37" height="33" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/managerPages/TrainingMode" className="training-mode-link">Training Mode</Link>
                <img src={image} alt="img" />
              </div>
            </div>

            <div className="image-cont-4">
              <div className="image-container">
                <svg className="my-tasks-image" width="38" height="32" viewBox="0 0 38 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_9_408" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="15" y="4" width="8" height="24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.8333 6.66667C15.8333 5.2 17.2583 4 18.9999 4C20.7416 4 22.1666 5.2 22.1666 6.66667V17.3333C22.1666 18.8 20.7416 20 18.9999 20C17.2583 20 15.8333 18.8 15.8333 17.3333V6.66667ZM15.8333 25.3333C15.8333 23.8606 17.251 22.6667 18.9999 22.6667C20.7488 22.6667 22.1666 23.8606 22.1666 25.3333C22.1666 26.8061 20.7488 28 18.9999 28C17.251 28 15.8333 26.8061 15.8333 25.3333Z" fill="black" />
                  </mask>
                  <g mask="url(#mask0_9_408)">
                    <rect width="38" height="32" fill="#D969DC" />
                  </g>
                </svg>

                <Link to="/managerPages/MyTasks" className="my-tasks-link">My Tasks</Link>
                <img src={image} alt="img" />
              </div>
            </div>
          </div>
          {/* <div className="col-lg-3 col-md-2 col-sm-12"></div> */}
        </div>
      </div >

    </>
  );
}

