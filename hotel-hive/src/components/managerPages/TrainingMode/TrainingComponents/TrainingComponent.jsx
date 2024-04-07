import "./TrainingComponent.css";
import React from "react";
import { useHistory } from "react-router-dom";

const TrainingComponent = ({id, name}) => {

    const history = useHistory()

    const handleChatClick = () => {
      const chatId = `/Training/${id}`;
      history.push(chatId);
    };
 
  return (
    <div onClick={handleChatClick}  className="mt-4 p-3 training-profile-card">
      <div className="d-flex justify-content-between">
        <p className="training-name"> {name}</p>
      </div>

    </div>
  )
}

export default TrainingComponent