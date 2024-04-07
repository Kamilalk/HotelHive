import React from 'react';
import { useHistory } from "react-router-dom";
import './NotificationComponent.css';

const NotificationComponent = ({id, type, title, message, description, time, date, info }) => {

    const history = useHistory()

    const handleRoomClick = () => {
        // Check the type of notification
        if (type === 'task') {
          // Construct the URL for the task page with the task ID as a parameter
          const taskURL = `/managerPages/MyTasks`;
          // Navigate to the task page
          history.push(taskURL);
        } else {
          // If the type is not 'task', navigate to a default page
          history.push('/default-page');
        }
      };

    return (
    <div onClick={handleRoomClick}  className="mt-4 p-3 notification-card">
      <div className="notification">
        <p className="title">{title}</p>
        <p className="message">{message}</p>
        {description && <p className="description">{description}</p>}
        <div className="time-date">
          <span className="time">{time} {date} </span> 
        </div>
      </div>
    </div>
    );
  };

export default NotificationComponent;