import React, { useState, useEffect } from 'react';
import './RosterEdit.css';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useHistory } from 'react-router-dom';
import { startOfWeek, format } from "date-fns";

function EditRoster() {
  const history = useHistory();
  const { docid, date } = useParams();
  const weekStartDate = startOfWeek(new Date(date));
  const formattedstartDate = format(weekStartDate, 'yyyy-MM-dd');
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [rosterDetails, setRosterDetails] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  console.log("weekStartDate:", weekStartDate);
  console.log("date:", date);
  console.log("docid:", docid);
  console.log("hotelId:", hotelId);

  useEffect(() => {
    const fetchRosterProfile = async () => {
      if (docid && hotelId && date) {
        const db = getFirestore();
        const rosterRef = doc(db, 'Hotels', hotelId, 'roster', formattedstartDate, formattedDate, docid);
  
        try {
          const rosterDocSnap = await getDoc(rosterRef);
          if (rosterDocSnap.exists()) {
            const data = rosterDocSnap.data();
            console.log('Roster profile:', data); // Log Roster profile data
            setRosterDetails(data);
          } else {
            console.log('Roster profile not found');
          }
        } catch (error) {
          console.error('Error fetching Roster profile:', error);
  
        }
      }
    };
  
    fetchRosterProfile();
  }, [docid, hotelId, date]);

  const handleEdit = async (e) => {
    e.preventDefault(); 

    try {
      const db = getFirestore();
      const rosterDocRef = doc(db, 'Hotels', hotelId, 'roster', formattedstartDate, formattedDate, docid);

      // Update staff details in Firestore
      await updateDoc(rosterDocRef, rosterDetails);

      console.log('Roster details updated successfully!');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating staff details:', error.message);

    }
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      const rosterDocRef = doc(db, 'Hotels', hotelId, 'roster', formattedstartDate, formattedDate, docid);

      // Delete staff document from Firestore
      await deleteDoc(rosterDocRef);

      console.log('roster profile deleted successfully!');
      history.push('/managerPages/Roster');
    } catch (error) {
      console.error('Error deleting staff:', error.message);
  
    }
  };

  const {
    name,
    startTime,
    endTime
  } = rosterDetails;

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 roster-edit-form'>
        <form onSubmit={handleEdit}>
            <p className='roster-title'>Edit Roster</p>
            <div className='input-container'>
                <span
                id="name"
                className="block w-full name-field"
                >{name}</span>
                <label htmlFor="startTime" className="block input-label">startTime:</label>
                <input
                type="time"
                name="startTime"
                value={startTime}
                onChange={e => setRosterDetails({ ...rosterDetails, startTime: e.target.value })}
                id="startTime"
                className="block w-full input-field"
                required
                />
                <label htmlFor="endTime" className="block input-label">endTime:</label>
                <input
                type="time"
                name="endTime"
                value={endTime}
                onChange={e => setRosterDetails({ ...rosterDetails, endTime: e.target.value })}
                id="endTime"
                className="block w-full input-field"
                required
                />
                <button type="submit" className="rounded form-btn">Edit Roster</button>
                <button onClick={handleDelete} className="rounded form-btn">Delete Roster Profile</button>
                <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
            </div>
        </form>
        {showSuccessPopup && (
          <div className="success-popup">
            <p>Roster details updated successfully!</p>

          </div>
        )}
    </div>
  );
}

export default EditRoster;