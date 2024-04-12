import { useEffect, useState } from 'react';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import {  setDoc, updateDoc, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useHistory, useParams} from "react-router-dom";
import { auth, database } from '../../../firebase'
import './RoomAssignmentProfile.css';
import TaskListComponent from './RoomAssignmentComponent/TaskListComponent';

const usePersistentState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const RoomAssignmentProfile= () => {

  const { roomNo } = useParams();
  console.log('roomNo:', roomNo);
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  console.log('hotelid:', hotelid);
  const [roomProfile, setRoomProfile] = useState(null);
  const history = useHistory();
  const [taskList, setTaskList] = useState([]); 
  const role = staffProfile.role;
  const name = staffProfile.fullName;
  const currentUserID = auth.currentUser.uid;
  const [assignee, setAssignee] = useState(null);
  const isRoomStartedKey = `isRoomStarted_${roomNo}`;
  const isWaitingForInspectionKey = `isWaitingForInspection_${roomNo}`;
  const isRoomCompletedKey = `isRoomCompleted_${roomNo}`;
  const isPausedbySupervisorKey = `isPausedbySupervisor_${roomNo}`;
  const [isRoomStarted, setIsRoomStarted] = usePersistentState(isRoomStartedKey, false);
  const [isWaitingForInspection, setIsWaitingForInspection] = usePersistentState(isWaitingForInspectionKey, false);
  const [isRoomCompleted, setIsRoomCompleted] = usePersistentState(isRoomCompletedKey, false);
  const [isPausedbySupervisor, setIsPausedbySupervisor] = usePersistentState(isPausedbySupervisorKey, false);



  useEffect(() => {
    const fetchRoomProfile = async () => {
      if (roomNo && hotelid) {
        const roomDocRef = doc(database, 'Hotels', hotelid, 'Rooms', roomNo);
        const roomListRef = collection(database, 'Hotels', hotelid, 'Rooms', roomNo, 'roomlist');
  
        try {
          const roomDocSnap = await getDoc(roomDocRef);
          if (roomDocSnap.exists()) {
            const data = roomDocSnap.data();
            console.log('Room profile:', data); // Log room profile data
            setRoomProfile(data);
          } else {
            console.log('Room profile not found');
          }
  
          // Fetch data from roomlist subcollection
          const roomListSnapshot = await getDocs(roomListRef);
          const tasks = roomListSnapshot.docs.map(doc => ({
            id: doc.id,
            listName: doc.data().listName,
            listTasks: doc.data().listTasks 
          })); 
          setTaskList(tasks);
          
  
        } catch (error) {
          console.error('Error fetching room profile:', error);
          // Handle error state here if needed
        }
      }
    };
  
    fetchRoomProfile();
  }, [roomNo, hotelid]);


  useEffect(() => {
    const fetchTaskList = async () => {
      const roomlistCollectionRef = collection(database, 'Hotels', hotelid, 'Rooms', roomNo, 'roomlist');
      const querySnapshot = await getDocs(roomlistCollectionRef);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        listTasks: doc.data().listTasks
      }));
      setTaskList(tasks);
    };
    fetchTaskList();
  }, [hotelid, roomNo]);



  useEffect(() => {
    const findAssigneeByRoomNumber = async () => {
      const allocationCollectionRef = collection(database, 'Hotels', hotelid, 'RoomAllocation');
      const querySnapshot = await getDocs(allocationCollectionRef);

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        userData.assignedRooms.forEach(room => {
          if (room.roomNumber === roomNo && userData.userId !== currentUserID) {
            setAssignee(userData);
          }
        });
      });
    };


  findAssigneeByRoomNumber();
}, [currentUserID]);

const sendNotification = async (msgTitle, msgMsg, msgDesc) => { 
  const notification = {
    title: msgTitle,
    type: 'room',
    message: msgMsg,
    description: msgDesc,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    info: { roomAssignee: currentUserID}
  };
  try {
    const userDocRef = doc(database, 'UserProfiles', assignee.userId);
    const notificationDocRef = doc(collection(userDocRef, 'notifications'));
    await setDoc(notificationDocRef, notification);
    console.log("Document written with ID: ", notificationDocRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }

}

  const updateRoomStatus = async (status) => {
    try {
      // Update cleaning status in RoomAllocation document
      const roomAllocationCollectionRef = collection(database, 'Hotels', hotelid, 'RoomAllocation');
      const querySnapshot = await getDocs(roomAllocationCollectionRef);
      for (const document of querySnapshot.docs) {
        let assignedRooms = [...document.data().assignedRooms];
        for (let room of assignedRooms) {
          if (room.roomNumber === roomNo) {
            room.cleaningStatus = status;
            const docRef = doc(database, 'Hotels', hotelid, 'RoomAllocation', document.id);
            await updateDoc(docRef, { assignedRooms });
            console.log(`Successfully updated cleaningStatus to '${status}' in RoomAllocation document with ID: ${document.id}`);
          }
        }
      }

      // Update cleaning status in RoomProfiles document
      const roomProfileRef = doc(database, 'Hotels', hotelid, 'Rooms', roomNo);
      await updateDoc(roomProfileRef, { cleaningStatus: status });
      console.log(`Successfully updated cleaningStatus to '${status}' in RoomProfiles document for room number: ${roomNo}`);
    } catch (error) {
      console.error('Error updating room status:', error);
      // Handle error state here if needed
    }
  };

  const refreshRoomProfile = async () => {
    try {
      // Fetch the room profile from the database
      const roomProfileDoc = await getDoc(doc(database, 'Hotels', hotelid, 'Rooms', roomNo));
      if (roomProfileDoc.exists()) {
        setRoomProfile(roomProfileDoc.data());
      } else {
        console.log(`No document found for room number: ${roomNo}`);
      }
    } catch (error) {
      console.error('Error fetching room profile:', error);
    }
  };

  console.log('Assignee:', assignee);

  console.log('roomProfile:', roomProfile);

  const updateTaskCompletionStatus = async (taskId, completed) => {
    try {

      const updatedTaskList = taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, completed };
        }
        return task;
      });
      setTaskList(updatedTaskList);
    } catch (error) {
      console.error('Error updating task completion status:', error);
    }
  };

  const checkTaskCompletion = async () => {
    try {
      console.log('Checking task completion...');
      // Fetch the task list from the database
      const roomlistCollectionRef = collection(database, 'Hotels', hotelid, 'Rooms', roomNo, 'roomlist');
      const querySnapshot = await getDocs(roomlistCollectionRef);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        listName: doc.data().listName,
        listTasks: doc.data().listTasks
      }));

      console.log('Fetched tasks:', tasks);

      // Check if any task is incomplete
      const incompleteTasks = tasks.filter(task => task.listTasks.some(taskItem => !taskItem.completed));

      console.log('Incomplete tasks:', incompleteTasks);

      return incompleteTasks; // Return the array of incomplete tasks
    } catch (error) {
      console.error('Error fetching task list:', error);
      throw error;
    }
  };

  const handleStartRoom = async () => {
    setIsRoomStarted(true);
    await updateRoomStatus('In Progress');
    await refreshRoomProfile();
    console.log(`Successfully updated cleaningStatus in RoomProfiles document with room number: ${roomNo}`);
  };


  const handlePauseRoom = async () => {
    setIsRoomStarted(false);
    await updateRoomStatus('To Be Continued')
    await refreshRoomProfile();
  };

  const handleSubmitRoom = async () => {
    try {
      console.log('Handling room submission...');
      // Check if any task is incomplete using checkTaskCompletion function
      const tasksIncomplete = await checkTaskCompletion();
      console.log('Has incomplete tasks:', tasksIncomplete);

      if (tasksIncomplete.length > 0) {
        // If there are incomplete tasks, generate an error message
        const incompleteTaskNames = tasksIncomplete.map(task => task.listName).join(', ');
        alert(`The following tasks are incomplete: ${incompleteTaskNames}`);
      } else {
        // If all tasks are complete, update the room status to 'Completed'
        await updateRoomStatus('Waiting For Inspection');
        await refreshRoomProfile();
        await sendNotification(`Ready For Check: ${roomNo}`, `Cleaned by: ${name}`, `All tasks completed for room ${roomNo}, ready for check.`);
        console.log(`Successfully updated cleaningStatus in RoomProfiles document with room number: ${roomNo}`);
        setIsRoomStarted(false);
        setIsWaitingForInspection(true);
        setIsRoomCompleted(true);

      }
    } catch (error) {
      console.error('Error handling room submission:', error);
      // Handle error state here if needed
    }
  };

  const handleEditClick = () => {
    history.push(`/editroomprofile/${roomNo}`);
  };

  const handleRoomCheck = async () => {
    setIsRoomStarted(true);
    setIsWaitingForInspection(true);
    setIsPausedbySupervisor(false);
    await updateRoomStatus('Check In Progress');
    await refreshRoomProfile();
  }

  const handlePauseCheck = async () => {
    setIsRoomStarted(false);
    setIsWaitingForInspection(true);
    setIsPausedbySupervisor(true);
    await updateRoomStatus('Check To Be Continued')
    await refreshRoomProfile();
  };


  const handleHelpRequest = () => {
    history.push(`/alertstaff/${roomNo}/${assignee.userId}`);
  };

  const deleteRoomFromAssignments = async (roomId) => {
    try {
      // Get all RoomAllocation documents
      const roomAllocationQuerySnapshot = await getDocs(collection(database, 'Hotels', hotelid, 'RoomAllocation'));
  
      // Iterate over each RoomAllocation document
      roomAllocationQuerySnapshot.forEach(async (doc) => {
        const roomAllocationData = doc.data();
        const updatedAssignedRooms = roomAllocationData.assignedRooms.filter(room => room.roomNumber !== roomId);
  
        // Update the RoomAllocation document with the modified assignedRooms array
        await updateDoc(doc.ref, { assignedRooms: updatedAssignedRooms });
  
        console.log(`Room ${roomId} successfully deleted from assignments in RoomAllocation document with ID: ${doc.id}`);
      });
  
      console.log(`Room ${roomId} successfully deleted from all assignments.`);
    } catch (error) {
      console.error('Error deleting room from assignments:', error);
      // Handle error state here if needed
    }
  };

  const handleCompleteCheck = async () =>  {

    const tasksIncomplete = await checkTaskCompletion();
    console.log('Has incomplete tasks:', tasksIncomplete);

    if (tasksIncomplete.length > 0) {
      // If there are incomplete tasks, generate an error message
      const incompleteTaskNames = tasksIncomplete.map(task => task.listName).join(', ');
      sendNotification(`Room incomplete: ${roomNo}`, `Checked by: ${name}`, `Incomplete Tasks ${incompleteTaskNames}`);
      await updateRoomStatus('Missing Tasks');
      await refreshRoomProfile();
      setIsRoomStarted(false);
      setIsWaitingForInspection(false);

    } else {
      await updateRoomStatus('Completed');
      await refreshRoomProfile();
      await sendNotification(`Ready complete: ${roomNo}`, `Checked by: ${name}`, `All tasks completed for room ${roomNo}.`);
      console.log(`Successfully updated cleaningStatus in RoomProfiles document with room number: ${roomNo}`);
      setIsRoomStarted(false);
      setIsWaitingForInspection(false);
      setIsRoomCompleted(true);
      deleteRoomFromAssignments(roomNo);
    }

  }
  useEffect(() => {
    console.log('isRoomStarted:', isRoomStarted);
    console.log('isWaitingForInspection:', isWaitingForInspection);
    console.log('isRoomCompleted:', isRoomCompleted);
    console.log('isPausedbySupervisor:', isPausedbySupervisor);
  }, [isRoomStarted, isWaitingForInspection, isRoomCompleted, isPausedbySupervisor]);

// isWaitingForInspection && 

  if (!roomProfile) {
    return <div>Loading...</div>;
  }

  return (
    
    <div>
    <div className='col-lg-6 col-md-6 col-sm-12 RoomAssignmentView-form'>
      <div className="title-container">
        <p className="RoomAssignmentView-title">Room Details</p>
      </div>
        <label for="roomNumber" class="block input-label">Room Number: </label>
        <div className="room-details">
          <p>{roomProfile.roomNumber}</p>
        </div>
        <label for="floorNumber" class="block input-label">Floor Number: </label>
        <div className="room-details">
          <p>{roomProfile.floor}</p>
        </div>
        <label for="bedNumber" class="block input-label">Bed Number: </label>
        <div className="room-details">
          <p>{roomProfile.beds}</p>
        </div>
        <label for="roomType" class="block input-label">Room Type: </label>
        <div className="room-details">
          <p>{roomProfile.roomType}</p>
        </div>
        <label for="occupationStatus" class="block input-label">Occupation Status: </label>
        <div className="room-details">
          <p>{roomProfile.occupationStatus}</p>
        </div>
        <label for="cleaningStatus" class="block input-label">Cleaning Status: </label>
        <div className="room-details">
          <p>{roomProfile.cleaningStatus}</p>
        </div>
        <label for="currentRes" class="block input-label">Current Reservation: </label>
        <div className="room-details">
          <p>{roomProfile.currentRes}</p>
        </div>
        <label for="checkInDate" class="block input-label">Check In Date: </label>
        <div className="room-details">
          <p>{roomProfile.reservationFrom}</p>
        </div>
        <label for="checkOutDate" class="block input-label">Check Out Date: </label>
        <div className="room-details">
          <p>{roomProfile.reservationTo}</p>
        </div>
        <label for="additionalNotes" class="block input-label">Additional Notes: </label>
        <div className="room-details">
          <p>{roomProfile.additionalNotes}</p>
        </div>
        <label for="tasklist" class="block input-label"> Task List: </label>
        <div className="room-details">
        <div className="room-details">
        <div>
        {taskList.map(task => (
          <div key={task.id}>
            {task.listTasks.map(taskItem => (
              <div key={taskItem.id}>
                <TaskListComponent
                  roomNo={roomNo} 
                  roomtask={taskItem} 
                  roomStarted={isRoomStarted}
                  updateTaskCompletionStatus={updateTaskCompletionStatus}
                 />
              </div>
            ))}
          </div>
        ))}
      </div>
      {role === 'Housekeeper' && !isRoomStarted && !isWaitingForInspection && !isPausedbySupervisor &&  <button className="rounded form-btn" onClick={handleStartRoom}>Start Room</button>}
      {role === 'Housekeeper' && isRoomStarted && !isWaitingForInspection &&   !isPausedbySupervisor && <button className="rounded form-btn" onClick={handlePauseRoom}>Pause Room</button>}
      {role === 'Housekeeper'  && isRoomStarted && !isWaitingForInspection &&  !isPausedbySupervisor && <button className="rounded form-btn" onClick={handleSubmitRoom}>Submit Room</button>}
      {role === 'Housekeeper' && isRoomStarted && !isWaitingForInspection &&   !isPausedbySupervisor && <button className="rounded form-btn" onClick={handleHelpRequest}>Ask for help </button>}
      {role === 'Supervisor' && !isRoomStarted &&   <button className="rounded form-btn" onClick={handleRoomCheck}>Start Room Check</button>}
      {role === 'Supervisor' && isRoomStarted &&  isWaitingForInspection &&  <button className="rounded form-btn" onClick={handlePauseCheck}>Pause Room Check </button>}
      {role === 'Supervisor' && isRoomStarted && isWaitingForInspection &&  <button className="rounded form-btn" onClick={handleCompleteCheck}>Check Complete</button>}
      {role === 'Supervisor' && isRoomStarted && isWaitingForInspection && <button className="rounded form-btn" onClick={handleHelpRequest}>Send Request</button>}
      
        </div>
      
        <div className="text-center mt-4">
        {role === 'Manager' && <button className="form-btn" onClick={handleEditClick}>
            Edit Room
          </button>}
          <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
        </div>
    </div>
</div> 

</div>
  );
};

export default RoomAssignmentProfile;