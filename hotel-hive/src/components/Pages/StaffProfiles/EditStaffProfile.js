import React, { useState, useEffect } from 'react';
import './EditStaffProfile.css';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { auth } from '../../../firebase';
import { useHistory } from "react-router-dom";


function EditStaffProfile() {
  const { userId } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const history = useHistory()
  const [staffDetails, setStaffDetails] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: ''
  });



  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (userId && hotelId) {
        const db = getFirestore();
        const staffDocRef = doc(db, 'UserProfiles', userId);
  
        try {
          const staffDocSnap = await getDoc(staffDocRef);
          if (staffDocSnap.exists()) {
            const data = staffDocSnap.data();
            console.log('Staff profile:', data); // Log staff profile data
            setStaffDetails(data);
          } else {
            console.log('Staff profile not found');
          }
        } catch (error) {
          console.error('Error fetching staff profile:', error);
   
        }
      }
    };
  
    fetchStaffProfile();
  }, [userId, hotelId]);


  const handleEdit = async (e) => {
    e.preventDefault(); 

    try {

  
      const db = getFirestore();
      const staffDocRef = doc(db, 'UserProfiles', userId);
      
      await updateDoc(staffDocRef, staffDetails);

  

      console.log('Staff details updated successfully!');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating staff details:', error.message);
     
    }
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      const staffDocRef = doc(db, 'UserProfiles', userId);

      // Delete staff document from Firestore
      await deleteDoc(staffDocRef);

      console.log('Staff deleted successfully!');
    } catch (error) {
      console.error('Error deleting staff:', error.message);
   
    }
  };


  const {
    fullName,
    role,
    phone
  } = staffDetails;

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 staff-form'>
        <form onSubmit={handleEdit}>
            <p className='page-title'>Edit Staff</p>
            <div className='input-container'>
                <label htmlFor="fullName" className="block input-label">Full Name:</label>
                <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={e => setStaffDetails({ ...staffDetails, fullName: e.target.value })}
                id="fullName"
                className="block w-full input-field"
                required
                />
                <label htmlFor="role" className="block input-label">Role:</label>
                <input
                type="text"
                name="role"
                value={role}
                onChange={e => setStaffDetails({ ...staffDetails, role: e.target.value })}
                id="role"
                className="block w-full input-field"
                required
                />
                <label htmlFor="email" className="block input-label">Email:</label>
                <span id="email" className="block w-full input-field">{staffDetails.email}</span>
                <label htmlFor="phone" className="block input-label">Phone:</label>
                <input
                type="tel"
                name="phone"
                value={phone}
                onChange={e => setStaffDetails({ ...staffDetails, phone: e.target.value })}
                id="phone"
                className="block w-full input-field"
               
                />
 
                <button type="submit" className="rounded form-btn">Edit Staff</button>
                <button onClick={handleDelete} className="rounded form-btn">Delete Staff</button>
                <button onClick={() => history.goBack()} className=" rounded form-btn">Back</button>
            </div>
        </form>
        {showSuccessPopup && (
          <div className="success-popup">
            <p>Staff details updated successfully!</p>

          </div>
        )}
    </div>
  );
}

export default EditStaffProfile;