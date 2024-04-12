
import './StaffProfilePage.css'
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {  doc, getDoc } from 'firebase/firestore';
import { database } from '../../../firebase';
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { useHistory } from "react-router-dom";

function StaffProfilePage() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const { staffProfile } = useStaffProfile();
    const role = staffProfile.role;
    const history = useHistory();

    const handleEditStaffClick = () => {
      history.push(`/editstaffprofile/${userId}`);
    };  
  
    useEffect(() => {
      const fetchStaffProfile = async () => {
        try {
          const docRef = doc(database, 'UserProfiles', userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
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
      <div className='col-lg-6 col-md-6 col-sm-12 staff-form'>
      {profile ? (
        <>
          <div className="title-container">
            <p className="staff-title">Profile Details</p>
          </div>
          <label htmlFor="fullName" className="block input-label">Full Name: </label>
          <div className="staff-details">
            <p>{profile.fullName}</p>
          </div>
          <label htmlFor="role" className="block input-label">Role: </label>
          <div className="staff-details">
            <p>{profile.role}</p>
          </div>
          <label htmlFor="staffId" className="block input-label">ID: </label>
          <div className="staff-details">
            <p>{userId}</p>
          </div>
          <label htmlFor="email" className="block input-label">Email: </label>
          <div className="staff-details">
            <p>{profile.email}</p>
          </div>
          <label htmlFor="phoneNo" className="block input-label">Phone No: </label>
          <div className="staff-details">
            <p>{profile.phone}</p>
          </div>
          <div className="text-center mt-4">
          {role === 'Manager' && <button className="rounded form-btn" onClick={handleEditStaffClick}>
              Edit
            </button> }
            <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
    );
  }
  
  export default StaffProfilePage;