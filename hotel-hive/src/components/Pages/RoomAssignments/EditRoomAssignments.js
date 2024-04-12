import { database } from '../../../firebase';
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from 'react';
import './EditRoomAssignments.css';
import { useHistory } from "react-router-dom";

function EditRoomAssignments() {
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;
    const [roomAssignments, setRoomAssignments] = useState([]);
    const [uniqueUserNames, setUniqueUserNames] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [roomsForSelectedUsers, setRoomsForSelectedUsers] = useState([]);
    const [roomsForSelectedUser, setRoomsForSelectedUser] = useState([]);
    const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(['', '']); 
    const [selectedRooms, setSelectedRooms] = useState(['', '']);
    const [selectedUser1, setSelectedUser1] = useState('');
    const [selectedUser2, setSelectedUser2] = useState('');
    const [selectedUserTo, setSelectedUserTo] = useState('');
    const [selectedUserToTransfer, setSelectedUserToTransfer] = useState('');
    const [selectedRoomToTransfer, setSelectedRoomToTransfer] = useState('');
    const [roomsForSelectedUserToTransfer, setRoomsForSelectedUserToTransfer] = useState([]);
    const [selectedUserNameRemove, setSelectedUserNameRemove] = useState("");
    const [selectedRoomNumberRemove, setSelectedRoomNumberRemove] = useState("");
    const [roomsForSelectedUserRemove, setRoomsForSelectedUserRemove] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (successMessage) {
            //display success message for 3 seconds
            const timeout = setTimeout(() => {
                setSuccessMessage('');
            }, 7000);
    
            //clear timeout on component unmount
            return () => clearTimeout(timeout);
        }
    }, [successMessage]);

    useEffect(() => {
        async function fetchData() {
          try {
            const { roomAssignments, uniqueUserNames } = await getAllRoomAssignments();
            setRoomAssignments(roomAssignments);
            setUniqueUserNames(uniqueUserNames);
          } catch (error) {
            console.error('Error:', error);
          }
        }
        fetchData();
      }, []);

    useEffect(() => {
        //create a new array to store the rooms for each selected user
        const newRoomsForSelectedUser = selectedUsers.map(user => getRoomsForUser(user));
    
        
        setRoomsForSelectedUser(newRoomsForSelectedUser);
    }, [selectedUsers]);

    useEffect(() => {
        const newRoomsForSelectedUser = selectedUsers.map(userName => {
            if (userName) {
                return getRoomsForUser(userName);
            } else {
                return [];
            }
        });
        setRoomsForSelectedUser(newRoomsForSelectedUser);
    }, [selectedUsers]);
    
    async function getAllRoomAssignments() {
        try {
          const roomAllocationCollectionRef = collection(database, `Hotels/${hotelId}/RoomAllocation`);
          const querySnapshot = await getDocs(roomAllocationCollectionRef);
      
          const roomAssignments = [];
          const userNamesSet = new Set();
      
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const assignedRooms = data.assignedRooms || [];
      
            assignedRooms.forEach((room) => {
              roomAssignments.push({
                cleaningStatus: room.cleaningStatus,
                floor: room.floor,
                occupationStatus: room.occupationStatus,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                name: data.name,
                role: data.role,
                userId: data.userId,
              });
      
              userNamesSet.add(data.name);
            });
          });
      
          const uniqueUserNames = Array.from(userNamesSet);
          console.log('Room Assignments:', roomAssignments);
          return { roomAssignments, uniqueUserNames };
        } catch (error) {
          console.error('Error fetching room assignments:', error);
          throw error; // Rethrow the error to be caught by the caller
        }
      }
    
    function handleUserNameChange(event, index) {
        const selectedName = event.target.value;
        setSelectedUserName(selectedName);
    
        // Filter room assignments based on selected user name
        const rooms = roomAssignments.filter((assignment) => assignment.name === selectedName);
        const roomNumbers = rooms.map((room) => room.roomNumber);
    
        // Update the selected room numbers
        const newSelectedRoomNumbers = [...selectedRoomNumbers];
        newSelectedRoomNumbers[index] = roomNumbers[0] || null;
        setSelectedRoomNumbers(newSelectedRoomNumbers);
    
        setRoomsForSelectedUserRemove(roomNumbers); // Update the state for "Remove Room"
    }
    
    function handleRoomNumberChange(event, index) {
        const roomNumber = event.target.value;
    
        // Update the selected room numbers
        const newSelectedRoomNumbers = [...selectedRoomNumbers];
        newSelectedRoomNumbers[index] = roomNumber;
        setSelectedRoomNumbers(newSelectedRoomNumbers);
    }

    function handleRoomNumberChangeDelete(event) {
        setSelectedRoomNumberRemove(event.target.value);
    }
    

    async function handleDeleteRoom(event) {
        event.preventDefault();
      
        try {
            const querySnapshot = await getDocs(collection(database, `Hotels/${hotelId}/RoomAllocation`));
              
            querySnapshot.forEach(async (doc) => {
                const data = doc.data();
                console.log('Data:', data); // Add this line
    
                const assignedRooms = data.assignedRooms || [];
                console.log('Assigned rooms:', assignedRooms); // Add this line
                  
                if (data.name === selectedUserNameRemove) {
                    const updatedAssignedRooms = assignedRooms.filter(room => room.roomNumber !== selectedRoomNumberRemove);
                    console.log('Updated assigned rooms:', updatedAssignedRooms); // Add this line
                
                    await updateDoc(doc.ref, { assignedRooms: updatedAssignedRooms });
                    setSuccessMessage(`Room ${selectedRoomNumberRemove} removed from ${selectedUserNameRemove}'s assignments.`);
                
                    console.log(`Room ${selectedRoomNumberRemove} removed from ${selectedUserNameRemove}'s assignments.`);
                }
            });
        } catch (error) {
              console.error('Error removing room:', error);
        }
    }

    function handleUserNameChange(event) {
        const selectedName = event.target.value;
        setSelectedUserNameRemove(selectedName);
    
        // Filter room assignments based on selected user name
        const rooms = roomAssignments.filter((assignment) => assignment.name === selectedName);
        const roomNumbers = rooms.map((room) => room.roomNumber);
    
        // Update the state variable for "Remove Room"
        setRoomsForSelectedUserRemove(roomNumbers);
    }
    
    // Function for selecting users for a comparative operation
    function handleUserChange(event, index) {
        const selectedUser = event.target.value;
        const newSelectedUsers = [...selectedUsers];
        newSelectedUsers[index] = selectedUser;
        setSelectedUsers(newSelectedUsers);
    
        // Filter rooms based on the selected user
        const roomsForSelectedUser = getRoomsForUser(selectedUser);
        const newRoomsForSelectedUser = [...roomsForSelectedUsers];
        newRoomsForSelectedUser[index] = roomsForSelectedUser;
        setRoomsForSelectedUsers(newRoomsForSelectedUser);
    }
    
    function getRoomsForUser(userName) {
        console.log(`Getting rooms for ${userName}`);
        const userRooms = roomAssignments.filter(assignment => assignment.name === userName);
        console.log(`Rooms for ${userName}:`, userRooms);
        return userRooms.map(room => room.roomNumber);
    }
      
    function handleRoomChange(event, index) {
        const selectedRoom = event.target.value;
        const newSelectedRooms = [...selectedRooms];
        newSelectedRooms[index] = selectedRoom;
        setSelectedRooms(newSelectedRooms);
    }

    function handleRoomSwitch(event) {
        event.preventDefault();
        // Navigate to the SwitchRooms component
      
    }

    async function handleRoomSwitch(event) {
        event.preventDefault();
    
        // Check if both users and rooms are selected
        if (selectedUsers[0] && selectedUsers[1] && selectedRooms[0] && selectedRooms[1]) {
            try {
                // Find the documents for both users
                const user1Doc = await getUserDocument(selectedUsers[0]);
                const user2Doc = await getUserDocument(selectedUsers[1]);
    
                if (user1Doc && user2Doc) {
                    // Get the room assignments for both users
                    const user1Rooms = user1Doc.data().assignedRooms || [];
                    const user2Rooms = user2Doc.data().assignedRooms || [];
    
                    // Find the room objects for selected rooms
                    const room1 = roomAssignments.find(room => room.roomNumber === selectedRooms[0]);
                    const room2 = roomAssignments.find(room => room.roomNumber === selectedRooms[1]);
    
                    // Update the room assignments for both users with the room data
                    const updatedUser1Rooms = user1Rooms.map(room => {
                        if (room.roomNumber === selectedRooms[0]) {
                            return room2;
                        } else {
                            return room;
                        }
                    });
    
                    const updatedUser2Rooms = user2Rooms.map(room => {
                        if (room.roomNumber === selectedRooms[1]) {
                            return room1;
                        } else {
                            return room;
                        }
                    });
    
                    // Update the Firestore documents with the new room assignments
                    await updateDoc(user1Doc.ref, { assignedRooms: updatedUser1Rooms });
                    await updateDoc(user2Doc.ref, { assignedRooms: updatedUser2Rooms });
                    
                    setSuccessMessage(`Rooms ${selectedRooms[0]} and ${selectedRooms[1]} swapped between ${selectedUsers[0]} and ${selectedUsers[1]}.`);
                    console.log(`Rooms ${selectedRooms[0]} and ${selectedRooms[1]} swapped between ${selectedUsers[0]} and ${selectedUsers[1]}.`);
                }
            } catch (error) {
                console.error('Error swapping rooms:', error);
            }
        } else {
            console.error('Please select both users and rooms to switch.');
        }
    }
    
    async function getUserDocument(userName) {
        const userQuery = query(collection(database, `Hotels/${hotelId}/RoomAllocation`), where('name', '==', userName));
        const querySnapshot = await getDocs(userQuery);
        return querySnapshot.docs[0]; // Return the first document found (assuming there's only one document per user)
    }

    const handleSwitchLists = async (event) => {
        event.preventDefault();
    
        if (selectedUser1 && selectedUser2) {
            try {
                // Find the documents for both users
                const user1Doc = await getUserDocument(selectedUser1);
                const user2Doc = await getUserDocument(selectedUser2);
    
                if (user1Doc && user2Doc) {
                    // Get the room assignments for both users
                    const user1Rooms = user1Doc.data().assignedRooms || [];
                    const user2Rooms = user2Doc.data().assignedRooms || [];
    
                    // Update the Firestore documents with the new room assignments
                    await updateDoc(user1Doc.ref, { assignedRooms: user2Rooms });
                    await updateDoc(user2Doc.ref, { assignedRooms: user1Rooms });

                    setSuccessMessage(`Room assignments switched between ${selectedUser1} and ${selectedUser2}.`);
    
                    console.log(`Room assignments switched between ${selectedUser1} and ${selectedUser2}.`);
                }
            } catch (error) {
                console.error('Error switching room assignments:', error);
            }
        } else {
            console.error('Please select both users to switch room assignments.');
        }
    };
    function handleRoomToTransferChange(event) {
        setSelectedRoomToTransfer(event.target.value);
    }

function handleUserToTransferChange(event) {
    setSelectedUserToTransfer(event.target.value);
    // Update the rooms for the selected user to transfer
    const rooms = getRoomsForUser(event.target.value);
    setRoomsForSelectedUserToTransfer(rooms);
}

    async function handleRoomTransfer(event) {
        event.preventDefault();
        if (selectedUserToTransfer && selectedRoomToTransfer && selectedUserTo) {
            try {
                // Find the documents for both users
                const userFromDoc = await getUserDocument(selectedUserToTransfer);
                const userToDoc = await getUserDocument(selectedUserTo);
    
                if (userFromDoc && userToDoc) {
                    // Get the room assignments for both users
                    const userFromRooms = userFromDoc.data().assignedRooms || [];
                    const userToRooms = userToDoc.data().assignedRooms || [];
    
                    // Find the room object for the selected room
                    const roomToTransfer = roomAssignments.find(room => room.roomNumber === selectedRoomToTransfer);
    
                    // Remove the transferred room from the current user's rooms
                    const updatedUserFromRooms = userFromRooms.filter(room => room.roomNumber !== selectedRoomToTransfer);
    
                    // Add the transferred room to the target user's rooms
                    const updatedUserToRooms = [...userToRooms, roomToTransfer];
    
                    // Update the Firestore documents with the new room assignments
                    await updateDoc(userFromDoc.ref, { assignedRooms: updatedUserFromRooms });
                    await updateDoc(userToDoc.ref, { assignedRooms: updatedUserToRooms });
                    setSuccessMessage(`Room ${selectedRoomToTransfer} transferred from ${selectedUserToTransfer} to ${selectedUserTo}.`);
    
                    console.log(`Room ${selectedRoomToTransfer} transferred from ${selectedUserToTransfer} to ${selectedUserTo}.`);
                }
            } catch (error) {
                console.error('Error transferring room:', error);
            }
        } else {
            console.error('Please select all fields to transfer the room.');
        }
    }



  return (

    <div className="col-lg-3 col-md-6 col-sm-12 EditRoomAssignments-form">
      <p className="m-0 EditRoomAssignments-title">Edit Room Assignments</p>
      <div className="RemoveRoom">
        <p className="m-0 EditRoomAssignments-subtitle"> Remove Room From List</p>
        <form onSubmit={handleDeleteRoom}>
        <select onChange={handleUserNameChange} value={selectedUserNameRemove}>
                <option value="">Select User</option>
                {uniqueUserNames.map((userName) => (
                    <option key={userName} value={userName}>{userName}</option>
                ))}
            </select>
          <select onChange={handleRoomNumberChangeDelete} value={selectedRoomNumberRemove}>
                <option value="">Select Room</option>
                {roomsForSelectedUserRemove.map((roomNumber) => (
                    <option key={roomNumber} value={roomNumber}>{`Room ${roomNumber}`}</option>
                ))}
            </select>
          <button type="submit" className="rounded form-btn">Delete</button>
        </form>
      </div>

      <div className="SwitchRooms">
        <p className="m-0 EditRoomAssignments-subtitle">Switch Rooms</p>
        <div>
          <label htmlFor="user1">User:</label>
          <select id="user1" onChange={(event) => handleUserChange(event, 0)} value={selectedUsers[0]}>
            <option value="">Select User</option>
            {uniqueUserNames.map((userName) => (
              <option key={userName} value={userName}>{userName}</option>
            ))}
          </select>
          <select id="room1" onChange={(event) => handleRoomChange(event, 0)} value={selectedRooms[0]}>
            <option value="">Select Room</option>
            {Array.isArray(roomsForSelectedUsers[0]) && roomsForSelectedUsers[0].map((roomNumber) => (
              <option key={roomNumber} value={roomNumber}>{`Room ${roomNumber}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="user2">User:</label>
          <select id="user2" onChange={(event) => handleUserChange(event, 1)} value={selectedUsers[1]}>
            <option value="">Select User</option>
            {uniqueUserNames.filter(userName => userName !== selectedUsers[0]).map((userName) => (
              <option key={userName} value={userName}>{userName}</option>
            ))}
          </select>
          {roomsForSelectedUsers[1] && (
            <select id="room2" onChange={(event) => handleRoomChange(event, 1)} value={selectedRooms[1]}>
              <option value="">Select Room</option>
              {Array.isArray(roomsForSelectedUsers[1]) && roomsForSelectedUsers[1].map((roomNumber) => (
                <option key={roomNumber} value={roomNumber}>{`Room ${roomNumber}`}</option>
              ))}
            </select>
          )}
        </div>
        {/* Submit button to navigate to SwitchRooms component */}
        <button onClick={handleRoomSwitch} className="rounded form-btn">Switch Rooms</button>
      </div>
      <div className="SwitchLists">
        <p className="m-0 EditRoomAssignments-subtitle">Switch Lists</p>
        
            <form onSubmit={handleSwitchLists}>
                <div>
                    <label htmlFor="user1">User:</label>
                    <select id="user1" onChange={(e) => setSelectedUser1(e.target.value)} value={selectedUser1}>
                        <option value="">Select User</option>
                        {uniqueUserNames.map((userName) => (
                            <option key={userName} value={userName}>{userName}</option>
                        ))}
                    </select>
                </div>
                {selectedUser1 && (
                    <div>
                        <label htmlFor="user2">User:</label>
                        <select id="user2" onChange={(e) => setSelectedUser2(e.target.value)} value={selectedUser2}>
                            <option value="">Select User</option>
                            {uniqueUserNames.filter((userName) => userName !== selectedUser1).map((userName) => (
                                <option key={userName} value={userName}>{userName}</option>
                            ))}
                        </select>
                    </div>
                )}
                <button type="submit" className="rounded form-btn">Submit</button>
            </form>
            </div>
            <div className="TransferRoom">
                <p className="m-0 EditRoomAssignments-subtitle">Transfer Room From User To User</p>
               <form onSubmit={handleRoomTransfer}>
               <div>
                   <label htmlFor="userToTransfer">User:</label>
                   <select id="userToTransfer" onChange={handleUserToTransferChange} value={selectedUserToTransfer}>
                       <option value="">Select User</option>
                       {uniqueUserNames.map((userName) => (
                           <option key={userName} value={userName}>{userName}</option>
                       ))}
                   </select>
               </div>
               {selectedUserToTransfer && (
                   <div>
                       <label htmlFor="roomToTransfer">Room:</label>
                       <select id="roomToTransfer" onChange={handleRoomToTransferChange} value={selectedRoomToTransfer}>
                           <option value="">Select Room</option>
                           {roomsForSelectedUserToTransfer.map((roomNumber) => (
                               <option key={roomNumber} value={roomNumber}>{`Room ${roomNumber}`}</option>
                           ))}
                       </select>
                   </div>
               )}
               {selectedUserToTransfer && (
                   <div>
                       <label htmlFor="userTo">Transfer To:</label>
                       <select id="userTo" onChange={(e) => setSelectedUserTo(e.target.value)} value={selectedUserTo}>
                           <option value="">Select User</option>
                           {uniqueUserNames.filter((userName) => userName !== selectedUserToTransfer).map((userName) => (
                               <option key={userName} value={userName}>{userName}</option>
                           ))}
                       </select>
                   </div>
               )}
               <button type="submit" className="rounded form-btn">Transfer Room</button>
               </form>

            </div>
            <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
            {successMessage && <div className="success-message">{successMessage}</div>}
    </div>

  );
}
export default EditRoomAssignments