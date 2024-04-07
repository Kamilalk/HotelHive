import "./RoomAssignments.css";
import React, { useEffect, useState } from 'react';
import { useRoomData } from "../../../RoomAlocAlg";
import Logo from "../../../assets/svgs/logo.svg";
import { Link } from "react-router-dom";
import RoomViewCard from '../../Cards/RoomViewCard';
import RoomAssignmentComponent from "../../RoomAssignmentComponent/RoomAssignmentComponent";

function RoomAssignment() {
  const [toggleProfile, setToggleProfile] = useState(false);
  const { getAllRooms } = useRoomData();
  const [housekeeperAssignments, setHousekeeperAssignments] = useState({});

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { housekeeperAssignments } = await getAllRooms();
  //       setHousekeeperAssignments(housekeeperAssignments);
  //     } catch (error) {
  //       console.error("Error fetching data: ", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <>
      {/* {Object.keys(housekeeperAssignments).map(housekeeperId => (
        <div key={housekeeperId}>
          <h2>Housekeeper: {housekeeperId}</h2>
          <ul>
            {housekeeperAssignments[housekeeperId].map(room => (
              <li key={room.id}>Room {room.roomNumber}</li>
            ))}
          </ul>
        </div>
      ))} */}

      <section className="p-5 room-assignments">
        <div className="d-flex align-items-center justify-content-between">
          <p className="m-0 page-title">Room Assignments</p>
          <Link
            // to="/managerPages/RoomAssignments/Update"
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
          >
            <span className="mr-2"> Manage Lists</span> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="mask0_9_972" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="12" height="12">
                <path d="M3.47233 8.66668H10.919L7.66566 11.92C7.40566 12.18 7.40566 12.6067 7.66566 12.8667C7.92566 13.1267 8.34566 13.1267 8.60566 12.8667L12.999 8.47334C13.259 8.21335 13.259 7.79334 12.999 7.53335L8.61233 3.13334C8.48778 3.00851 8.31868 2.93835 8.14233 2.93835C7.96599 2.93835 7.79689 3.00851 7.67233 3.13334C7.41233 3.39334 7.41233 3.81334 7.67233 4.07334L10.919 7.33334H3.47233C3.10566 7.33334 2.80566 7.63335 2.80566 8.00001C2.80566 8.36668 3.10566 8.66668 3.47233 8.66668Z" fill="black" />
              </mask>
              <g mask="url(#mask0_9_972)">
                <rect width="16" height="16" fill="#09101D" />
              </g>
            </svg>
          </Link>
        </div>

        <div>
          <RoomAssignmentComponent />
          <RoomAssignmentComponent />
          <RoomAssignmentComponent />
          <RoomAssignmentComponent />
        </div>
      </section>
    </>
  );
}

export default RoomAssignment;