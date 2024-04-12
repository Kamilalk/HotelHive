import React, {  useState } from 'react';
import { useRoomData } from "./RoomAlocALg/RoomAlocAlg";
import { allocateRoomsToStaff } from "./RoomAlocALg/room-allocation"
import RoomAssignmentComponent from "./RoomAssignmentComponent/RoomAssignmentComponent";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { database } from '../../../firebase';
import { useHistory } from "react-router-dom";
import { collection, query, where, getDocs, addDoc,  deleteDoc,  } from 'firebase/firestore';
import './RoomAssignments.css'



function RoomAssignment() {
  const { getAllRooms, getDataForAllocation } = useRoomData();
  const [housekeeperAssignments, setHousekeeperAssignments] = useState({});
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const role = staffProfile.role;
  const history = useHistory();


  async function saveHousekeeperAssignments(housekeeperAssignments) {
    const allocationCollectionRef = collection(database, `Hotels/${hotelId}/RoomAllocation`);
  
    try {
      //loop through each housekeeper assignment
      for (const [housekeeperId, assignedRooms] of Object.entries(housekeeperAssignments)) {
        //find the user data of the housekeeper
        const user = await findUserByName(housekeeperId);
        if (!user) {
          console.log(`No user found for housekeeper ${housekeeperId}. Skipping document creation.`);
          continue;
        }
  
        const { userId, fullName, role } = user;
  
        //find and delete any existing document for the housekeeper
        const existingDocRef = await findDocById(userId);
        if (existingDocRef) {
          await deleteDoc(existingDocRef);
          console.log(`Existing document for housekeeper ${fullName} deleted.`);
        } else {
          console.log(`No existing document found for housekeeper ${fullName}. Skipping deletion.`);
        }
  
        //create a new document for each housekeeper assignment
        const docRef = await addDoc(allocationCollectionRef, {
          name: fullName,
          userId, //attach the user ID to the document
          role, // attach the user role to the document
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
      //return the reference to the first matching document
      return querySnapshot.docs[0].ref;
    } else {
   
      return null;
    }
  }

  const handleEditRoomAssignmentsClick = () => {
    history.push("/managerPages/EditRoomAssignments");
  };

  

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
        
        const userData = querySnapshot.docs[0].data();
        
        return { userId: querySnapshot.docs[0].id, fullName: userData.fullName, role: userData.role };
      } else {
        
        return null;
      }
    } catch (error) {
      console.error("Error finding user by name: ", error);
      throw error;
    }
  }

  // Function to handle button click to fetch data again
  const handleGenerateRoomAssignmentsClick = async () => {
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
          {role === 'Manager' &&
            <button onClick={handleEditRoomAssignmentsClick}
              className="rounded text-black d-flex align-items-center justify-content-between RoomAssignments-button ml-1"
            >
               Edit Assignments
            </button>}
            {role === 'Manager' &&
            <button onClick={handleGenerateRoomAssignmentsClick}
              className="rounded text-black d-flex align-items-center justify-content-between RoomAssignments-button ml-1"
            >
              Generate Room Assignments
            </button>}
            <button onClick={() => history.goBack()} className="rounded text-black d-flex align-items-center justify-content-between RoomAssignments-button ml-1">Back</button>

          </div>
        </div>
      <RoomAssignmentComponent housekeeperAssignments={housekeeperAssignments} />
    </div>
  );
}

export default RoomAssignment;