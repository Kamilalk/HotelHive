import { useParams } from 'react-router-dom';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { doc, getDoc, getFirestore, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import './EditRoomProfile.css';

function EditRoomProfile() {
  const { roomNo } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [roomDetails, setRoomDetails] = useState({
    roomNumber: '',
    floor: '',
    beds: '',
    roomType: '',
    occupationStatus: '',
    cleaningStatus: '',
    additionalNotes: ''
  });

  useEffect(() => {
    const fetchRoomProfile = async () => {
      if (roomNo && hotelid) {
        const db = getFirestore();
        const roomDocRef = doc(db, 'Hotels', hotelid, 'Rooms', roomNo);
  
        try {
          const roomDocSnap = await getDoc(roomDocRef);
          if (roomDocSnap.exists()) {
            const data = roomDocSnap.data();
            console.log('Room profile:', data); 
            setRoomDetails(data);
          } else {
            console.log('Room profile not found');
          }
        } catch (error) {
          console.error('Error fetching room profile:', error);

        }
      }
    };
  
    fetchRoomProfile();
  }, [roomNo, hotelid]);


  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const db = getFirestore();
      const roomDocRef = doc(db, 'Hotels', hotelid, 'Rooms', roomNo);

     
      await updateDoc(roomDocRef, roomDetails);
      await updateRoomAssignment(roomNo, roomDetails);
      console.log('Room details updated successfully!');
    } catch (error) {
      console.error('Error updating room details:', error.message);
    
    }
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      const roomDocRef = doc(db, 'Hotels', hotelid, 'Rooms', roomNo);

      // Delete room document from Firestore
      await deleteDoc(roomDocRef);
    

      console.log('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error.message);

    }
  };

  const updateRoomAssignment = async (roomNumber, updatedRoomDetails) => {
    try {
      const db = getFirestore();
      const roomAllocationCollectionRef = collection(db, 'Hotels', hotelid, 'RoomAllocation');
      const roomAllocationSnapshot = await getDocs(roomAllocationCollectionRef);
  
      console.log('Number of documents:', roomAllocationSnapshot.docs.length);
  
      const updatePromises = roomAllocationSnapshot.docs.map(async (doc) => {
        const assignedRooms = doc.data().assignedRooms.map(room => {
          if (room.roomNumber === roomNumber) {
            return { ...room, ...updatedRoomDetails };
          }
          return room;
        });
  
        console.log('Assigned Rooms Before Update:', doc.data().assignedRooms);
        console.log('Updated Room Details:', updatedRoomDetails);
        console.log('Assigned Rooms After Update:', assignedRooms);
  
        await updateDoc(doc.ref, { assignedRooms });
  
        console.log('Document Updated:', doc.id);
      });
  
      await Promise.all(updatePromises);
  
      console.log('Room assignments updated successfully!');
    } catch (error) {
      console.error('Error updating room assignments:', error.message);
      // Handle error state here if needed
    }
  };

  const {
    roomNumber,
    floor,
    beds,
    roomType,
    occupationStatus,
    cleaningStatus,
    additionalNotes
  } = roomDetails;

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 room-input'>
        <form onSubmit={handleSubmit}>
            <p className='d-flex align-items-center justify-content-between page-title'>Edit Room</p>
            <div className='input-container'>
                <label for="roomNumber" class="block input-label">Room Number:</label>
                <input
                type="text"
                name="roomNumber"
                value={roomNumber}
                onChange={e => setRoomDetails({ ...roomDetails, roomNumber: e.target.value })}
                id="roomNumber"
                class="block w-full input-field"
                required
                />
                <label for="floor" class="block input-label">Floor Number:</label>
                <input
                type="text"
                name="floor"
                value={floor}
                onChange={e => setRoomDetails({ ...roomDetails, floor: e.target.value })}
                id="floor"
                class="block w-full input-field"
                required
                />
                <label for="beds" class="block input-label">Number Of Beds:</label>
                <input
                type="text"
                name="beds"
                value={beds}
                onChange={e => setRoomDetails({ ...roomDetails, beds: e.target.value })}
                id="beds"
                class="block w-full input-field"
                required
                />
                <label for="roomType" class="block input-label">Room Type:</label>
                <input
                type="text"
                name="roomType"
                value={roomType}
                onChange={e => setRoomDetails({ ...roomDetails, roomType: e.target.value })}
                id="roomType"
                class="block w-full input-field"
                required
                />
                <label htmlFor="occupationStatus" className="block input-label">Occupation Status:</label>
                <select
                name="occupationStatus"
                value={occupationStatus}
                onChange={e => setRoomDetails({ ...roomDetails, occupationStatus: e.target.value })}
                id="occupationStatus"
                className="block w-full input-field"
                required
                >
                <option value="">Select Room Status</option>
                <option value="occupied">Occupied</option>
                <option value="unoccupied">Unoccupied</option>
                <option value="departed">Departed</option>
                </select>
                <label htmlFor="cleaningStatus" className="block input-label">Cleaning Status:</label>
                <select
                name="cleaningStatus"
                value={cleaningStatus}
                onChange={e => setRoomDetails({ ...roomDetails, cleaningStatus: e.target.value })}
                id="cleaningStatus"
                className="block w-full input-field"
                required
                >
                <option value="">Select Cleaning Status</option>
                <option value="clean">Clean</option>
                <option value="dirty">Dirty</option>
                <option value="in-progress">In Progress</option>
                <option value="not-checked">Not Checked</option>
                </select>
                <label for="additionalNotes" class="block input-label">Additional Notes:</label>
                <textarea
                    type="textarea"
                    name="additionalNotes"
                    value={additionalNotes} 
                    onChange={e => setRoomDetails({ ...roomDetails, additionalNotes: e.target.value })}
                    id="additionalNotes"
                    class="block w-full input-field"
                ></textarea>
                <button  type="submit" className="form-btn">Edit room</button>
                <button onClick={handleDelete} className="form-btn">Delete Room</button>
            </div>	
        </form>
    </div>
  );
}

export default EditRoomProfile;