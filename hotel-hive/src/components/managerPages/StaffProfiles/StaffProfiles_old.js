import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import Nav from '../../Nav/Nav'
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { database } from "../../../firebase";

function StaffProfiles() {
  const history = useHistory();
  const { staffProfile } = useStaffProfile();
  const collectionRef = collection(database, "UserProfiles")
  const [userP, setUserP] = useState([])
  const hotelid = staffProfile.hotelId;

  useEffect(() => {
    const q = query(collectionRef, where("hotelId", "==", hotelid));
    onSnapshot(q, (querySnapshot) => {
      setUserP(querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName
      })));
    });
  }, [collectionRef, hotelid]);

  return (
    <>
      <Nav fixed="top" style={{ position: 'fixed', top: 0 }} />
      <h1>Staff Profiles</h1>
      <button onClick={() => history.push('/managerPages/AddStaff')}>Add Staff</button>
      <div>
        {userP.map((userProf) => (
          <div key={userProf.id}>
            <p>ID: {userProf.id}</p>
            <p>Name: {userProf.fullName}</p>
          </div>

        ))}

      </div>
      <button onClick={() => history.goBack()}>Back</button>
    </>
  );
}

export default StaffProfiles;