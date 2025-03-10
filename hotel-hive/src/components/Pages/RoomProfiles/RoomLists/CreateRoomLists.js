import { useState, useEffect } from 'react';
import { useStaffProfile } from '../../../../contexts/StaffProfileContext';
import './CreateRoomLists.css'
import { database } from '../../../../firebase';
import { collection, getDocs, setDoc, doc, getDoc, deleteDoc, query, where } from "firebase/firestore"



function CreateRoomLists() {

  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [listName, setListName] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [listTasks, setListTasks] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleRoomCheckboxChange = (roomId) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  // Function to add a task to the list
  const addTaskToList = () => {
    if (taskInput.trim() !== '') {
      setListTasks([...listTasks, taskInput.trim()]);
      setTaskInput('');
    }
  };
  
  const deleteTask = (index) => {
    const updatedTasks = listTasks.filter((_, i) => i !== index);
    setListTasks(updatedTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
          const existingRooms = await Promise.all(selectedRooms.map(async roomId => {
            const roomListsRef = collection(database, `Hotels/${hotelid}/RoomLists`);
            const roomListQuery = query(roomListsRef, where('roomNumbers', 'array-contains', roomId));
            const roomListSnapshot = await getDocs(roomListQuery);
            return roomListSnapshot.docs.map(doc => doc.id);
        }));

        //flatten the array of existing room lists
        const existingRoomLists = existingRooms.flat();

        //if any room is assigned to other lists, remove it from those lists
        await Promise.all(existingRoomLists.map(async listId => {
            const listRef = doc(collection(database, `Hotels/${hotelid}/RoomLists`), listId);
            const listDoc = await getDoc(listRef);
            if (listDoc.exists()) {
                const { roomNumbers } = listDoc.data();
                const updatedRoomNumbers = roomNumbers.filter(roomId => !selectedRooms.includes(roomId));
                await setDoc(listRef, { roomNumbers: updatedRoomNumbers }, { merge: true });
            }
        }));

        const newListId = generateUniqueId();
        const roomListsRef = collection(database, `Hotels/${hotelid}/RoomLists`);
        await setDoc(doc(roomListsRef, newListId), {
            listName: listName,
            listTasks: listTasks,
            roomNumbers: selectedRooms
        });
    
        await Promise.all(selectedRooms.map(async roomId => {
          const roomListRef = collection(database, `Hotels/${hotelid}/Rooms/${roomId}/roomlist`);
         
          const roomListSnapshot = await getDocs(roomListRef);
          
          //iterate over each document and delete it
          roomListSnapshot.forEach(async doc => {
              console.log('Deleting document:', doc.id); 
              await deleteDoc(doc.ref);
              console.log('Document deleted successfully.'); 
          });
        
          //add the new document
          console.log('Adding new document...');
          await setDoc(doc(roomListRef, newListId), {
              listName: listName,
              listTasks: listTasks.map(task => ({ id: generateUniqueId(), task: task, completed: false }))
          });
          console.log('New document added successfully.'); 
      }));
      
      // Reset state variables after successful submission
        setListName('');
        setListTasks([]);
        setSelectedRooms([]);
        setError('');
        setSuccessMessage('Room list created successfully!');
      // Redirect or perform any other action upon successful submission
    // Example: Redirect to dashboard
    } catch (error) {
      console.error('Error adding room list:', error);
      setError('Failed to add room list. Please try again.');
    }
  };

  function generateUniqueId() {
    // Generate a random string of characters
    const randomChars = Math.random().toString(36).substr(2, 10);
    // Generate a timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    // Combine the random characters and timestamp to create the unique ID
    const uniqueId = randomChars + timestamp;
    return uniqueId;
  }



  return (
    <div className='col-lg-6 col-md-6 col-sm-12 room-lists-input'>
        <form onSubmit={handleSubmit}>
            <p className='d-flex align-items-center justify-content-between room-lists-title'>Create Room List</p>
            <div className='input-container'>
                <label htmlFor="listName" className="block input-label">List Name:</label>
                <input
                type="text"
                name="listName"
                value={listName}
                onChange={e => setListName(e.target.value)}
                id="listName"
                className="block w-full input-field"
                required
                />
                <label htmlFor="listTasks" className="block input-label">List Tasks :</label>
                <div className="task-list">
                        {listTasks.map((task, index) => (
                    <div key={index} className="task-item">
                        {task}
                        <button type="button" onClick={() => deleteTask(index)} className="delete-button">Delete</button>
                    </div>
                    ))}
                    {/* Render an empty task item when listTasks is empty */}
                    {listTasks.length === 0 && <div className="task-item">No tasks added yet</div>}
                </div>
                <label htmlFor="listTasks" className="block input-label">List Tasks :</label>
                <input
                    type="text"
                    name="taskInput"
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    placeholder="Enter task"
                    id="taskInput"
                    className="block w-full input-field"
                    
                    />
                <button type="button" className="form-btn" onClick={addTaskToList}>Add Task</button>
                
                <label htmlFor="selectedRooms" className="block input-label">Select Rooms :</label>
                <div className='input-container room-checkboxes'>
                {loading ? (
                    <p>Loading rooms...</p>
                ) : (
                    rooms.map(room => (
                    <div key={room.id} className="room-checkbox">
                        <input
                        type="checkbox"
                        id={room.id}
                        name="selectedRooms"
                        checked={selectedRooms.includes(room.id)}
                        onChange={() => handleRoomCheckboxChange(room.id)}
                        />
                        <label htmlFor={room.id}>{room.roomNumber} - {room.roomType}</label>
                    </div>
                    ))
                )}
                </div>
               
                <button  type="submit" className="form-btn">Add List</button>
            </div>	
            {successMessage && <div className="success-message">{successMessage}</div>}
        </form>
    </div>
  );
}

export default CreateRoomLists;