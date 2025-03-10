import React, { useState, useEffect } from 'react';
import './EditMyProfile.css';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useHistory } from 'react-router-dom';
import { auth } from '../../../firebase';



function EditMyProfile() {
  const history = useHistory();
  const { userId } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [staffDetails, setStaffDetails] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: ''
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
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
          // Handle error state here if needed
        }
      }
    };
  
    fetchStaffProfile();
  }, [userId, hotelId]);

  const handleEdit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const user = auth.currentUser;

      if (auth.currentUser.uid !== userId && (staffDetails.email !== '' || passwords.newPassword !== '')) {
        console.error('You are not authorized to modify this account.');
        // You can display an error message to the user here
        return;
      }
  
      const db = getFirestore();
      const staffDocRef = doc(db, 'UserProfiles', userId);
      // Update staff details in Firestore
      await updateDoc(staffDocRef, staffDetails);

      if (staffDetails.email !== '') {
        await user.updateEmail(staffDetails.email);
        console.log('Email updated successfully');
      }
  
      if (passwords.newPassword !== '' && passwords.newPassword === passwords.confirmPassword) {
        await user.updatePassword(passwords.newPassword);
        console.log('Password updated successfully');
      }
  
      console.log('Staff details updated successfully!');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating staff details:', error.message);
      // Handle error state here if needed
    }
  };


  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const {
    fullName,
    email,
    phone
  } = staffDetails;

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 EditMyProfile-form'>
       
      <form onSubmit={handleEdit}>
        <p className='page-title'>Edit My Profile</p>
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
          <p className="block input-label">Role: {staffProfile.role}</p> {/* Display role as text */}
          <label htmlFor="email" className="block input-label">Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => setStaffDetails({ ...staffDetails, email: e.target.value })}
            id="email"
            className="block w-full input-field"
            required
          />
          <label htmlFor="phone" className="block input-label">Phone:</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={e => setStaffDetails({ ...staffDetails, phone: e.target.value })}
            id="phone"
            className="block w-full input-field"
            required
          />
          <label htmlFor="newPassword" className="block input-label">New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            id="newPassword"
            className="block w-full input-field"
            r
          />
          <label htmlFor="confirmPassword" className="block input-label">Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            id="confirmPassword"
            className="block w-full input-field"
            
          />
          <button type="submit" className="rounded form-btn">Submit Edit</button>
          <button onClick={() => history.goBack()} className="rounded form-btn">Back</button> 
        </div>
      </form>
      {showSuccessPopup && (
        <div className="success-popup">
          <p>details updated successfully!</p>
        </div>
      )}
    </div>

  );
}

export default EditMyProfile;