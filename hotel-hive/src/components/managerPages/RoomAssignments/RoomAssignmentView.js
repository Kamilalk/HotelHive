import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useHistory, useParams} from "react-router-dom";
import { database } from '../../../firebase'
import './RoomAssignmentView.css';

const RoomAssignmentView= () => {

  const { roomNo } = useParams();
  console.log('roomNo:', roomNo);
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  console.log('hotelid:', hotelid);
  const [roomProfile, setRoomProfile] = useState(null);
  const history = useHistory();
// Define roomInfo state

useEffect(() => {
  const fetchRoomProfile = async () => {
    if (roomNo && hotelid) {
      const roomDocRef = doc(database, 'Hotels', hotelid, 'Rooms', roomNo);

      try {
        const roomDocSnap = await getDoc(roomDocRef);
        if (roomDocSnap.exists()) {
          const data = roomDocSnap.data();
          console.log('Room profile:', data); // Log room profile data
          setRoomProfile(data);
        } else {
          console.log('Room profile not found');
        }
      } catch (error) {
        console.error('Error fetching room profile:', error);
        // Handle error state here if needed
      }
    }
  };

  fetchRoomProfile();
}, [roomNo, hotelid]);

console.log('roomProfile:', roomProfile);

const handleEditClick = () => {
  history.push(`/editroomprofile/${roomNo}`);
};

if (!roomProfile) {
  return <div>Loading...</div>;
}

  return (
    <>
    <div className='col-lg-6 col-md-6 col-sm-12 RoomAssignmentView-form'>
      <div className="title-container">
        <p className="RoomAssignmentView-title">Room Details</p>
      </div>
        <label for="roomNumber" class="block input-label">Room Number: </label>
        <div className="room-details">
          <p>{roomProfile.roomNumber}</p>
        </div>
        <label for="floorNumber" class="block input-label">Floor Number: </label>
        <div className="room-details">
          <p>{roomProfile.floor}</p>
        </div>
        <label for="bedNumber" class="block input-label">Bed Number: </label>
        <div className="room-details">
          <p>{roomProfile.beds}</p>
        </div>
        <label for="roomType" class="block input-label">Room Type: </label>
        <div className="room-details">
          <p>{roomProfile.roomType}</p>
        </div>
        <label for="occupationStatus" class="block input-label">Occupation Status: </label>
        <div className="room-details">
          <p>{roomProfile.occupationStatus}</p>
        </div>
        <label for="cleaningStatus" class="block input-label">Cleaning Status: </label>
        <div className="room-details">
          <p>{roomProfile.cleaningStatus}</p>
        </div>
        <label for="currentRes" class="block input-label">Current Reservation: </label>
        <div className="room-details">
          <p>{roomProfile.currentRes}</p>
        </div>
        <label for="checkInDate" class="block input-label">Check In Date: </label>
        <div className="room-details">
          <p>{roomProfile.reservationFrom}</p>
        </div>
        <label for="checkOutDate" class="block input-label">Check Out Date: </label>
        <div className="room-details">
          <p>{roomProfile.reservationTo}</p>
        </div>
        <label for="additionalNotes" class="block input-label">Additional Notes: </label>
        <div className="room-details">
          <p>{roomProfile.additionalNotes}</p>
        </div>
        <div className="text-center mt-4">
          <button className="form-btn" onClick={handleEditClick}>
            Edit Room
          </button>
        </div>
    </div>
    </>
  );
};

export default RoomAssignmentView;