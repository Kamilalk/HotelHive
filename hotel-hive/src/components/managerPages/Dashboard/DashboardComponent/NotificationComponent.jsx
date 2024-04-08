import { useHistory } from "react-router-dom";
import './NotificationComponent.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { database } from '../../../../firebase';
import React, { useEffect, useState } from 'react'
import { doc, deleteDoc } from 'firebase/firestore';

const NotificationComponent = ({ id, type, title, message, description, time, date, info, onDelete }) => {
  const history = useHistory();
  const [userId, setUserId] = useState(null);


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

  const handleNotificationClick = () => {
    if (type === 'task') {
      const taskURL = `/managerPages/MyTasks`;
      history.push(taskURL);
    } else {
      history.push('/default-page');
    }
  };

  const handleDelete = async (event) => {
    // Prevent the click event from bubbling up to the parent div
    event.stopPropagation();
    try {
      // Construct the reference to the notification document
      const notificationDocRef = doc(database, 'UserProfiles', userId, 'notifications', id);
      
      // Delete the notification document
      await deleteDoc(notificationDocRef);
  
      console.log(`Notification with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting notification with ID ${id}:`, error);
    }
    // Add your deletion logic here
  };




  return (
    <div onClick={handleNotificationClick} className="mt-4 p-3 notification-card">
      <div className="notification">
        <p className="title">{title}</p>
        <p className="message">{message}</p>
        {description && <p className="description">{description}</p>}
        <div className="time-date">
          <span className="time">{time} {date}</span>
        </div>
        {/* Delete button/icon */}
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationComponent;