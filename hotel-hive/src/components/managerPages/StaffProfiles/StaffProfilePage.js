
import './StaffProfilePage.css'
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { database } from '../../../firebase';
;


function StaffProfilePage() {
    const { userId } = useParams();
    const [staffProfile, setStaffProfile] = useState(null);
  
    useEffect(() => {
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
      <div className='col-lg-6 col-md-6 col-sm-12 staff-form'>
        <div className="title-container">
          <p className="staff-title">Profile Details</p>
        </div>
        <label htmlFor="fullName" className="block input-label">Full Name: </label>
        <div className="staff-details">
          <p>{staffProfile.fullName}</p>
        </div>
        <label htmlFor="role" className="block input-label">Role: </label>
        <div className="staff-details">
          <p>{staffProfile.role}</p>
        </div>
        <label htmlFor="staffId" className="block input-label">ID: </label>
        <div className="staff-details">
          <p>{userId}</p>
        </div>
        <label htmlFor="email" className="block input-label">Email: </label>
        <div className="staff-details">
          <p>{staffProfile.email}</p>
        </div>
        <label htmlFor="phoneNo" className="block input-label">Phone No: </label>
        <div className="staff-details">
          <p>{staffProfile.phone}</p>
        </div>
        <div className="text-center mt-4">
          <button className="form-btn">
            <Link to={`/editstaffprofile/${userId}`}>Edit</Link>
          </button>
        </div>
      </div>
    );
  }
  
  export default StaffProfilePage;