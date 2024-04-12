
import './MyProfilePage.css'
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {  doc, getDoc } from 'firebase/firestore';
import { database } from '../../../firebase';



function MyProfilePage() {
    const history = useHistory();
    const { userId } = useParams();
    const [staffProfile, setStaffProfile] = useState(null);

    const handleProfileEditClick = () => {
      history.push(`/editmyprofile/${userId}`);
    };
  
    useEffect(() => {
      console.log('userId inside useEffect:', userId); // Add this line
    
      const fetchStaffProfile = async () => {
        try {
          const docRef = doc(database, 'UserProfiles', userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStaffProfile(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching document: ', error);
        }
      };
    
      fetchStaffProfile();
    }, [userId]);
  
    if (!staffProfile) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className='col-lg-6 col-md-6 col-sm-12 MyProfile-form'>
        <div className="profile-container">
          <p className="MyProfile-title">My Profile</p>
        </div>
        <label htmlFor="fullName" className="block input-label">Full Name: </label>
        <div className="MyProfile-details">
          <p>{staffProfile.fullName}</p>
        </div>
        <label htmlFor="role" className="block input-label">Role: </label>
        <div className="MyProfile-details">
          <p>{staffProfile.role}</p>
        </div>
        <label htmlFor="staffId" className="block input-label">ID: </label>
        <div className="MyProfile-details">
          <p>{userId}</p>
        </div>
        <label htmlFor="email" className="block input-label">Email: </label>
        <div className="MyProfile-details">
          <p>{staffProfile.email}</p>
        </div>
        <label htmlFor="phoneNo" className="block input-label">Phone No: </label>
        <div className="MyProfile-details">
          <p>{staffProfile.phone}</p>
        </div>
        <div className="text-center mt-4">
          <button className="rounded form-btn" onClick={handleProfileEditClick}>
            Edit
          </button>
          <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
        </div>
      </div>
    );
  }
  
  export default MyProfilePage;