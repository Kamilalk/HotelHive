import React, { useEffect } from "react";
import "./RosterComponent.css";
import { useHistory } from "react-router-dom";

const RosterComponent = ({ docid, date, id, name, role,  startTime, finishTime }) => {
  const history = useHistory();

  const handleRoomClick = () => {
    const rostereditURL = `/roster/edit/${docid}/${date}`;
    history.push(rostereditURL);

  };

  // Log whenever the component receives props
  useEffect(() => {
    console.log("RosterComponent received props:", { id, name, startTime, finishTime });
  }, [id, name, startTime, finishTime]);

  // Check if any required prop is missing
  if (!id || !name || !startTime || !finishTime) {
    console.error("Error: Missing props");
    return (
      <div className="error-message">
        Error: Missing props
      </div>
    );
  }

  return (
    <div onClick={handleRoomClick} className="mt-4 p-3 roster-card">
      <div className="d-flex justify-content-between">
        <div className="user-info">
          <p className="name">{name}</p>
          <p className="role">{role}</p> 
        </div>
      </div>

      <div className="user-details">
        <p className="time">Scheduled Time: {`${startTime} - ${finishTime}`}</p>

      </div>
    </div>
  );
};

export default RosterComponent;
