import { useState, useRef } from 'react';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { useHistory } from 'react-router-dom';
import { RoomProfile } from '../../../objects/RoomProfile';
import { AddRoom } from '../../../FirestoreOperations';
import './AddRoom.css'



function AddRooms() {
  const history = useHistory();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [roomNumber, setRoomNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [occupationStatus, setOccupationStatus] = useState('');
  const [cleaningStatus, setCleaningStatus] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError('');
      setLoading(true);

      const newRoom = new RoomProfile(
        roomNumber,
        hotelid,
        floorNumber,
        bedNumber,
        roomType,
        occupationStatus,
        cleaningStatus,
        additionalNotes,
        null,
        null,
        null
      );

      await AddRoom(newRoom, hotelid);

      history.push('/managerPages/RoomProfiles');
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room');
    }

    setLoading(false);
  }


  return (
    <div className='col-lg-6 col-md-6 col-sm-12 room-input'>
        <form onSubmit={handleSubmit}>
            <p className='d-flex align-items-center justify-content-between page-title'>Add Room</p>
            <div className='input-container'>
                <label for="roomNumber" class="block input-label">Room Number:</label>
                <input
                type="text"
                name="roomNumber"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                id="roomNumber"
                class="block w-full input-field"
                required
                />
                <label for="floorNumber" class="block input-label">Floor Number:</label>
                <input
                type="text"
                name="floorNumber"
                value={floorNumber}
                onChange={e => setFloorNumber(e.target.value)}
                id="floorNumber"
                class="block w-full input-field"
                required
                />
                <label for="bedNumber" class="block input-label">Number Of Beds:</label>
                <input
                type="text"
                name="bedNumber"
                value={bedNumber}
                onChange={e => setBedNumber(e.target.value)}
                id="bedNumber"
                class="block w-full input-field"
                required
                />
                <label for="roomType" class="block input-label">Room Type:</label>
                <input
                type="text"
                name="roomType"
                value={roomType}
                onChange={e => setRoomType(e.target.value)}
                id="roomType"
                class="block w-full input-field"
                required
                />
                <label htmlFor="occupationStatus" className="block input-label">Occupation Status:</label>
                <select
                name="occupationStatus"
                value={occupationStatus}
                onChange={e => setOccupationStatus(e.target.value)}
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
                onChange={e => setCleaningStatus(e.target.value)}
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
                    onChange={e => setAdditionalNotes(e.target.value)}
                    id="additionalNotes"
                    class="block w-full input-field"
                ></textarea>
                <button  type="submit" className="form-btn">Add Task</button>
            </div>	
        </form>
    </div>
  );
}

export default AddRooms;