import StaffProfilesComponent from "../../StaffProfilesComponent/StaffProfilesComponent";
import "./StaffProfiles.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { database } from "../../../firebase";
import { useHistory } from "react-router-dom";

const StaffProfiles = () => {

  const { staffProfile } = useStaffProfile();
  const collectionRef = collection(database, "UserProfiles")
  const [userP, setUserP] = useState([])
  const hotelid = staffProfile.hotelId;
  const history = useHistory();
  
  const handleAddStaffClick = () => {
    history.push("/managerPages/AddStaff");
  };


  useEffect(() => {
    const q = query(collectionRef, where("hotelId", "==", hotelid));
    onSnapshot(q, (querySnapshot) => {
      setUserP(querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName,
        role: doc.data().role, 
        email: doc.data().email,
        phone: doc.data().phone,
      })));
    });
  }, [collectionRef, hotelid]);

  return (
    <section className="p-5 staff-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 page-title">Staff Profiles</p>
        <div className="d-flex">
          <button
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
            onClick={handleAddStaffClick}
          >
            Add Staff
          </button>
        </div>
      </div>

      <div className="row">
        {userP.map((staff, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <StaffProfilesComponent
              id={staff.id}
              name={staff.fullName}
              occupation={staff.role}
              email={staff.email}
              phone={staff.phone}
            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default StaffProfiles