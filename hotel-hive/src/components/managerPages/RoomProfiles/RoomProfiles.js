import "./RoomProfiles.css";
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { database } from "../../../firebase";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import RoomProfilesComponent from "../../RoomProfilesComponent/RoomProfilesComponent";

const RoomProfiles = () => {
  const history = useHistory();
  const [roomProfiles, setRoomProfiles] = useState([]);
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId; // Replace this with the actual hotel ID

  useEffect(() => {
    // Function to fetch room profiles
    async function fetchRoomProfiles() {
      try {
        const roomCollectionRef = collection(database, `Hotels/${hotelId}/Rooms`);
        const querySnapshot = await getDocs(roomCollectionRef);
        const roomProfilesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRoomProfiles(roomProfilesData);
      } catch (error) {
        console.error("Error fetching room profiles:", error);
      }
    }

    // Call the fetchRoomProfiles function when the component mounts
    fetchRoomProfiles();
  }, [hotelId]);

  return (
    <>
      <section className="p-5 room-profiles">
        <div className="d-flex align-items-center justify-content-between">
          <p className="m-0 page-title">Room Profiles</p>
          <div className="d-flex">
            <button
              className="rounded text-black d-flex align-items-center justify-content-between page-button ml-1"
            >
              <Link to="/managerPages/RoomLists">Room Lists</Link>
            </button>

            <button
              className="rounded text-black d-flex align-items-center justify-content-between page-button ml-1"
            >
              <Link to="/managerPages/AddRooms">Add Profile</Link>
            </button>

            <button
              className="rounded text-black d-flex align-items-center justify-content-between page-button ml-1"
            >
              <Link to="/managerPages/CSVUpload">Add Several Profiles</Link>
            </button>
          </div>
        </div>

        <div className="row">
          {/* Map over room profiles data and generate RoomProfilesComponent */}
          {roomProfiles.map((profile, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-sm-12">
              <RoomProfilesComponent
                roomNo={profile.roomNumber}
                floorNo={profile.floor}
                cleaningStatus={profile.cleaningStatus}
                checkInDate={profile.reservationFrom}
                checkOutDate={profile.reservationTo}
                occupationStatus={profile.occupationStatus}
                bedType={profile.roomType}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default RoomProfiles;