import "./RoomAssignmentComponent.css";
import RoomViewCard from "../Cards/RoomViewCard";
import { collection, query, where, getDocs, addDoc, getDoc, deleteDoc, setDoc, doc } from 'firebase/firestore';
import { database } from '../../firebase';
import { useStaffProfile } from '../../contexts/StaffProfileContext';
import React, { useState, useEffect } from 'react';

function RoomAssignmentComponent() {

  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;

  const [userAssignments, setUserAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      const allocationCollectionRef = collection(database, `Hotels/${hotelId}/RoomAllocation`);
      const querySnapshot = await getDocs(allocationCollectionRef);
      const assignments = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        assignments.push({ userId: data.userId, name: data.name, role: data.role, assignedRooms: data.assignedRooms });
      });

      setUserAssignments(assignments);
      setLoading(false);
    };

    fetchAssignments();
  }, [hotelId]);

  

    return (
      <div>
        {userAssignments.map(userAssignment => (
          <div key={userAssignment.userId} className="py-3 room-assignments-component">
            <div className="d-flex align-items-center">
              <p className="text-black mx-2 mb-0 name">{userAssignment.name} - {userAssignment.role} </p>
            </div>
            <div className="row">
              {userAssignment.assignedRooms.map(room => (
                <div key={room.roomNumber} className="col-lg-3 col-md-6 col-sm-12">
                  <RoomViewCard
                    roomNumber={room.roomNumber}
                    floor={room.floor}  
                    roomType={room.roomType} 
                    cleaningStatus={room.cleaningStatus} 
                    occupationStatus={room.occupationStatus}  
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

export default RoomAssignmentComponent

