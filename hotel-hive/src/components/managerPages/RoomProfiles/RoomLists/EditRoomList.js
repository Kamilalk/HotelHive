import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStaffProfile } from '../../../../contexts/StaffProfileContext';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useHistory } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { database } from '../../../../firebase';
import './EditRoomList.css';

const EditRoomList = () => {
  const location = useLocation();
  const { id } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [roomList, setRoomList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [newListTasks, setNewListTasks] = useState([]);
  const [newRoomNumbers, setNewRoomNumbers] = useState([]);
  const history = useHistory();
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null); // State variable for tracking which task is being edited
  const [editedTask, setEditedTask] = useState(''); 
  const [taskInput, setTaskInput] = useState("");


  useEffect(() => {
    // Fetch rooms from Firestore when component mounts
    const fetchRooms = async () => {
      try {
        const roomsCollection = collection(database, `Hotels/${hotelid}/Rooms`);
        const roomsSnapshot = await getDocs(roomsCollection);
        const roomsData = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRooms(roomsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);


  useEffect(() => {
    const fetchRoomListProfile = async () => {
      if (hotelid && id) {
        const roomListDocRef = doc(database, 'Hotels', hotelid, 'RoomLists', id);

        try {
          const roomListDocSnap = await getDoc(roomListDocRef);
          if (roomListDocSnap.exists()) {
            const data = roomListDocSnap.data();
            console.log('Room list:', data); // Log room list data
            setRoomList(data);
            // Set initial values for editing
            setNewListName(data.listName);
            setNewListTasks(data.listTasks);
            setNewRoomNumbers(data.roomNumbers);
            setSelectedRooms(data.roomNumbers);
          } else {
            console.log('Room list not found');
          }
        } catch (error) {
          console.error('Error fetching room list:', error);
          // Handle error state here if needed
        }
      }
    };

    fetchRoomListProfile();
  }, [hotelid, id]);


  const handleEditList = async () => {
    try {
      // Construct the updated room list object
      const updatedRoomList = {
        listName: newListName,
        listTasks: newListTasks,
        roomNumbers: selectedRooms
      };

      const updatedRoomListRooms = {
        listName: newListName,
        listTasks: newListTasks.map(task => ({ task: task, completed: false })), // Add completed field to each task
      };
  
      // Update the room list in Firestore
      const roomListDocRef = doc(database, 'Hotels', hotelid, 'RoomLists', id);
      await setDoc(roomListDocRef, updatedRoomList);

      await Promise.all(selectedRooms.map(async roomId => {
        const roomListRef = collection(database, `Hotels/${hotelid}/Rooms/${roomId}/roomlist`);
        await setDoc(doc(roomListRef, id), updatedRoomListRooms); // Use the same ID for the document
      }));

      newRoomNumbers.forEach(async roomId => {
        // Check if the room is not selected
        if (!selectedRooms.includes(roomId)) {
          try {
            // Delete the document for the room
            const roomListRef = collection(database, `Hotels/${hotelid}/Rooms/${roomId}/roomlist`);
            await deleteDoc(doc(roomListRef, id));
          } catch (error) {
            console.error('Error deleting room list document:', error);
            // Handle error if needed
          }
        }
      });
  
      // Redirect to the appropriate page after successful update
      history.push('/path/to/redirect');
  
    } catch (error) {
      console.error('Error updating room list:', error);
      // Handle error state here if needed
    }
  };

  const handleCheckboxChange = (roomId) => {
    if (selectedRooms.includes(roomId)) {
      // Room is currently selected, so remove it from the list
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      // Room is not selected, so add it to the list
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };


  const handleTaskEdit = (index) => {
    // Update the task in the newListTasks array
    setNewListTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = editedTask;
      return updatedTasks;
    });
    // Clear the editing index and edited task
    setEditingIndex(null);
    setEditedTask('');
  };
 
  
  const addTaskToList = () => {
    setNewListTasks([...newListTasks, taskInput]);
    setTaskInput("");
  };

  const handleEditTask = (index) => {
    setEditingIndex(index);
    setEditedTask(newListTasks[index]); // Set the task to be edited from newListTasks
  };
  

  const handleDeleteTask = (index) => {
    setNewListTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      updatedTasks.splice(index, 1);
      return updatedTasks;
    });
  };

  const handleDeleteList = async () => {
    try {
        // Delete the list entirely
        const roomListDocRef = doc(database, 'Hotels', hotelid, 'RoomLists', id);
        await deleteDoc(roomListDocRef);
    
        // Delete the list for each room in newRoomNumbers
        await Promise.all(newRoomNumbers.map(async roomId => {
          try {
            const roomListRef = collection(database, `Hotels/${hotelid}/Rooms/${roomId}/roomlist`);
            await deleteDoc(doc(roomListRef, id));
          } catch (error) {
            console.error('Error deleting room list document for room:', roomId, error);
            // Handle error if needed
          }
        }));
    
        // Redirect to the appropriate page after successful deletion
        history.push('/path/to/redirect');
      } catch (error) {
        console.error('Error deleting room list:', error);
        // Handle error state here if needed
      }
  };

  if (!roomList) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <div className='col-lg-6 col-md-6 col-sm-12 edit-room-list-form'>
        <p className="edit-room-list-container">Edit List</p>

      <label htmlFor="newListName" className="block input-label">New List Name: </label>
      <input
        type="text"
        name="newListName"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        className="block w-full input-field"
      />
        <div className='existing-tasks'>
          <p className='existing-tasks-title'>Existing Tasks:</p>
          {newListTasks.map((task, index) => (
            <div key={index} className='task-item'>
              {editingIndex === index ? (
                <>
                  <input
                    type='text'
                    value={editedTask}
                    onChange={e => setEditedTask(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => handleTaskEdit(editingIndex)}>Submit</button>
                </>
              ) : (
                <>
                  <p className='task-text'>{task}</p>
                  <div className='task-buttons'>
                    <button type='button' onClick={() => handleEditTask(index)}>
                      Edit
                    </button>
                    <span className='button-spacing'></span>
                    <button type='button' onClick={() => handleDeleteTask(index)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <label htmlFor="newListTasks" className="block input-label">New List Tasks: </label>
        <div className="input-container">
        <input
            type="text"
            name="taskInput"
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            placeholder="Enter task"
            id="taskInput"
            className="block w-full input-field"
            required
            />
        <button type="button" className="form-btn" onClick={addTaskToList}>Add Task</button>
        </div>
        <label htmlFor="newRoomNumbers" className="block input-label">New Room Numbers: </label>
        <div className="room-list-profile-details row">
            {rooms.map(room => (
                <div key={room.id} className="col-lg-6">
                <input
                    type="checkbox"
                    id={room.id}
                    name="selectedRooms"
                    checked={selectedRooms.includes(room.id)}
                    onChange={() => handleCheckboxChange(room.id)}
                />
                <label htmlFor={room.id}>{room.roomNumber} - {room.roomType}</label>
                </div>
            ))}
            </div>
      <div className="text-center mt-4">
        <button className="form-btn" onClick={handleEditList}>
          Save Changes
        </button>
        <button className="form-btn" onClick={handleDeleteList}>
          Delete
        </button>
      </div>
    </div>
  </>
);
            
};


export default EditRoomList;
