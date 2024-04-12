import "./RoomViewCard.css";
import React from "react";
import { useHistory } from "react-router-dom";

const RoomViewCard = ({
  roomNumber,
  floor,
  roomType,
  cleaningStatus,
  occupationStatus,

}
) => {
  const history = useHistory();

  //const lastThreeNumbers = roomNumber.slice(-3); 

  const handleRoomClick = () => {
    const rostereditURL = `/roomtaskView/${roomNumber}`;
    history.push(rostereditURL);

  };

  return (
    <div onClick={handleRoomClick} className="mt-4 p-3 room-view-card" style={{ backgroundColor: " rgba(217, 105, 220, 0.47)" }}>
      <div className="d-flex justify-content-between">
        <p className="title">{`Room ${roomNumber}`}</p>
        <svg width="33" height="28" viewBox="0 0 33 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_74_444" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="1" y="8" width="31" height="12">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.875 8.16669H26.125C29.1637 8.16669 31.625 10.255 31.625 12.8334V17.5C31.625 18.7834 30.3875 19.8334 28.875 19.8334H4.125C2.6125 19.8334 1.375 18.7834 1.375 17.5V9.33335C1.375 8.69169 1.99375 8.16669 2.75 8.16669C3.50625 8.16669 4.125 8.69169 4.125 9.33335V16.3334H15.125V10.5C15.125 9.21669 16.3625 8.16669 17.875 8.16669ZM13.75 11.6667C13.75 13.5917 11.8938 15.1667 9.625 15.1667C7.35625 15.1667 5.5 13.5917 5.5 11.6667C5.5 9.74169 7.35625 8.16669 9.625 8.16669C11.8938 8.16669 13.75 9.74169 13.75 11.6667Z" fill="black" />
          </mask>
          <g mask="url(#mask0_74_444)">
            <rect width="33" height="28" fill="white" />
          </g>
        </svg>
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0">
          <span className="status">{floor}</span>
          <span className="ml-3 type"> {roomType}</span>
        </p>

        <div className="d-flex flex-column">
          <span className="bed-type">{cleaningStatus}</span>
          <span className="bed-type">{occupationStatus}</span>
        </div>
      </div>
    </div>
  )
}

export default RoomViewCard