import "./RoomListsComponent.css";
import React from "react";
import { useHistory } from "react-router-dom";

const RoomListsComponent = ({id, name}) => {

    const history = useHistory()

    const handleRoomListClick = () => {
      const roomlistId = `/roomlist/${id}`;
      history.push(roomlistId);
    };
 
  return (
    <div onClick={handleRoomListClick}  className="mt-4 p-3 room-list-card">
      <div className="d-flex justify-content-between">
        <p className="room-list-name"> {name}</p>
      </div>

    </div>
  )
}

export default RoomListsComponent