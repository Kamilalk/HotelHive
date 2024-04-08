import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useStaffProfile } from '../../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './RoomListProfile.css';
import { useHistory } from "react-router-dom";
import { useParams } from 'react-router-dom';


const RoomListProfile = () => {
  const location = useLocation();
  const { id } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [roomList, setRoomList] = useState(null);
  const history = useHistory();
// Define roomInfo state

useEffect(() => {
    const fetchRoomListProfile = async () => {
      if (hotelid && id) {
        const db = getFirestore();
        const roomListDocRef = doc(db, 'Hotels', hotelid, 'RoomLists', id);

        try {
          const roomListDocSnap = await getDoc(roomListDocRef);
          if (roomListDocSnap.exists()) {
            const data = roomListDocSnap.data();
            console.log('Room list:', data); // Log room list data
            setRoomList(data);
          } else {
            console.log('Room list not found');
          }
        } catch (error) {
          console.error('Error fetching room list:', error);
          // Handle error state here if needed
        }
      }
    };

    fetchRoomListProfile();
  }, [hotelid, id]);

  // Your component code


const handleEditClick = () => {
  history.push(`/editroomlistprofile/${id}`);
};

if (!roomList) {
  return <div>Loading...</div>;
}

  return (
    <>
    <div className='col-lg-6 col-md-6 col-sm-12 room-list-profile-form'>
      <div className="room-list-profile-container">
        <p className="room-list-profile-title">List Details</p>
      </div>
        <label htmlFor="roomNumber" className="block input-label">List Name: </label>
        <div className="room-list-profile-details">
          <p>{roomList.listName}</p>
        </div>
        <label htmlFor="floorNumber" className="block input-label">List Tasks: </label>
        <div className="room-list-profile-details" style={{ marginBottom: '10px' }}>
          {/* Display each task in the list */}
          {roomList.listTasks.map((task, index) => (
            <p key={index}>{task}</p>
          ))}
        </div>
      <label htmlFor="bedNumber" className="block input-label">Rooms Attached: </label>
      <div className="room-list-profile-details">
            <div className="room-numbers-row">
            {/* Display the first row of room numbers */}
            {roomList.roomNumbers.slice(0, Math.ceil(roomList.roomNumbers.length / 2)).map((roomNumber, index) => (
            <p key={index}>{roomNumber}</p>
            ))}
        </div>
        <div className="room-numbers-row">
            {/* Display the second row of room numbers */}
            {roomList.roomNumbers.slice(Math.ceil(roomList.roomNumbers.length / 2)).map((roomNumber, index) => (
            <p key={index}>{roomNumber}</p>
            ))}
        </div>
      </div>
        <div className="text-center mt-4">
          <button className="form-btn" onClick={handleEditClick}>
            Edit List
          </button>
        </div>
    </div>
    </>
  );
};

export default RoomListProfile;