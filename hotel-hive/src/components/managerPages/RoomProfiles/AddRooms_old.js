import { useState, useRef } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { useHistory } from 'react-router-dom';
import { RoomProfile } from '../../../objects/RoomProfile';
import { AddRoom } from '../../../FirestoreOperations';



function AddRooms() {
  const history = useHistory();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const roomNumberRef = useRef();
  const floorRef = useRef();
  const bedsRef = useRef();
  const roomTypeRef = useRef();
  const occupationStatusRef = useRef();
  const cleaningStatusRef = useRef();
  const additionalNotesRef = useRef();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError('');
      setLoading(true);

      const newRoom = new RoomProfile(
        roomNumberRef.current.value,
        hotelid,
        floorRef.current.value,
        bedsRef.current.value,
        roomTypeRef.current.value,
        occupationStatusRef.current.value,
        cleaningStatusRef.current.value,
        additionalNotesRef.current.value,
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
    <>
      <div >
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Add Room</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="roomNumber">
                <Form.Label>Room Number</Form.Label>
                <Form.Control type="number" ref={roomNumberRef} required />
              </Form.Group>
              <Form.Group id="floor">
                <Form.Label>Floor</Form.Label>
                <Form.Control type="number" ref={floorRef} required />
              </Form.Group>
              <Form.Group id="beds">
                <Form.Label>Number of Beds</Form.Label>
                <Form.Control type="number" ref={bedsRef} required />
              </Form.Group>
              <Form.Group id="roomType">
                <Form.Label>Room Type</Form.Label>
                <Form.Control type="text" ref={roomTypeRef} required />
              </Form.Group>
              <Form.Group id="occupationStatus">
                <Form.Label>Occupation Status</Form.Label>
                <Form.Control as="select" ref={occupationStatusRef} required>
                  <option value="">Select Occupation Status</option>
                  <option value="occupied">Occupied</option>
                  <option value="unoccupied">Unoccupied</option>
                  <option value="departed">Departed</option>
                </Form.Control>
              </Form.Group>
              <Form.Group id="cleaningStatus">
                <Form.Label>Cleaning Status</Form.Label>
                <Form.Control as="select" ref={cleaningStatusRef} required>
                  <option value="">Select Cleaning Status</option>
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                  <option value="in-progress">In Progress</option>
                  <option value="not-checked">Not Checked</option>
                </Form.Control>
              </Form.Group>
              <Form.Group id="additionalNotes">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control as="textarea" rows={3} ref={additionalNotesRef} />
              </Form.Group>
              <Button disabled={loading} className="w-100" type="submit">Add Room</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default AddRooms;