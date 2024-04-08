import React, { useEffect, useState } from 'react';
import { useRoomData } from "./RoomAlocALg/RoomAlocAlg";
import { allocateRoomsToStaff } from "./RoomAlocALg/room-allocation"
import RoomAssignmentComponent from "../../RoomAssignmentComponent/RoomAssignmentComponent";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { database } from '../../../firebase';
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, addDoc, getDoc, deleteDoc, setDoc, doc } from 'firebase/firestore';
import './RoomAssignments.css'


function RoomAssignment() {
  const { getAllRooms, getDataForAllocation } = useRoomData();
  const [housekeeperAssignments, setHousekeeperAssignments] = useState({});
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;


  async function saveHousekeeperAssignments(housekeeperAssignments) {
    const allocationCollectionRef = collection(database, `Hotels/${hotelId}/RoomAllocation`);
  
    try {
      // Loop through each housekeeper assignment
      for (const [housekeeperId, assignedRooms] of Object.entries(housekeeperAssignments)) {
        // Find the user data of the housekeeper
        const user = await findUserByName(housekeeperId);
        if (!user) {
          console.log(`No user found for housekeeper ${housekeeperId}. Skipping document creation.`);
          continue;
        }
  
        const { userId, fullName, role } = user;
  
        // Find and delete any existing document for the housekeeper
        const existingDocRef = await findDocById(userId);
        if (existingDocRef) {
          await deleteDoc(existingDocRef);
          console.log(`Existing document for housekeeper ${fullName} deleted.`);
        } else {
          console.log(`No existing document found for housekeeper ${fullName}. Skipping deletion.`);
        }
  
        // Create a new document for each housekeeper assignment
        const docRef = await addDoc(allocationCollectionRef, {
          name: fullName,
          userId, // Attach the user ID to the document
          role, // Attach the user role to the document
          assignedRooms: assignedRooms.map(room => ({
            roomNumber: room.roomNumber,
            floor: room.floor,
            roomType: room.roomType,
            cleaningStatus: room.cleaningStatus,
            occupationStatus: room.occupationStatus
          }))
        });
        console.log("Document written with ID: ", docRef.id);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  }

  async function findDocById(id) {
    const allocationCollectionRef = collection(database, `Hotels/${hotelId}/RoomAllocation`);
    const querySnapshot = await getDocs(query(allocationCollectionRef, where("userId", "==", id)));
    if (!querySnapshot.empty) {
      // Return the reference to the first matching document
      return querySnapshot.docs[0].ref;
    } else {
      // If no matching document found, return null
      return null;
    }
  }


  

  async function findUserByName(name) {
    const userProfilesCollectionRef = collection(database, 'UserProfiles');
  
    try {
      // Query the UserProfiles collection to find the user with the given name and hotelId
      const querySnapshot = await getDocs(query(userProfilesCollectionRef, 
        where("fullName", "==", name),
        where("hotelId", "==", hotelId)
      ));
  
      // Check if any user with the given name and hotelId exists
      if (!querySnapshot.empty) {
        // Extract user data from the first matching document
        const userData = querySnapshot.docs[0].data();
        // Return an object containing user ID, full name, and role
        return { userId: querySnapshot.docs[0].id, fullName: userData.fullName, role: userData.role };
      } else {
        // If no matching user found, return null or handle as appropriate
        return null;
      }
    } catch (error) {
      console.error("Error finding user by name: ", error);
      throw error;
    }
  }




  // Function to handle button click to fetch data again
  const handleButtonClick = async () => {
    try {
      const [staff, rooms] = await getDataForAllocation();
      const allocationResult = allocateRoomsToStaff(staff, rooms);

      setHousekeeperAssignments(allocationResult);
      saveHousekeeperAssignments(allocationResult);


    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  return (
    <div>
        <div className="d-flex align-items-center justify-content-between">
          <p className="m-0 RoomAssignments-title">Room Assignments</p>
          <div className="d-flex">
            <button
              className="rounded text-black d-flex align-items-center justify-content-between RoomAssignments-button ml-1"
            >
              <Link to="/managerPages/EditRoomAssignments"> Edit Assignments</Link>
            </button>

            <button onClick={handleButtonClick}
              className="rounded text-black d-flex align-items-center justify-content-between RoomAssignments-button ml-1"
            >
              Generate Room Assignments
            </button>

          </div>
        </div>
      <RoomAssignmentComponent housekeeperAssignments={housekeeperAssignments} />
    </div>
  );
}

export default RoomAssignment;