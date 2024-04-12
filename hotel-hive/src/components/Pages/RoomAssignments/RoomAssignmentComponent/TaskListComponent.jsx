
import { getDoc, updateDoc, collection, getDocs  } from 'firebase/firestore';
import { database } from '../../../../firebase'; 
import { useStaffProfile } from '../../../../contexts/StaffProfileContext';
import { useState } from 'react';

const TaskListComponent = ({roomNo, roomtask, roomStarted }) => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [completed, setCompleted] = useState(roomtask.completed);

  const updateTaskCompletedField = async () => {
    try {
      const roomlistCollectionRef = collection(database, 'Hotels', hotelid, 'Rooms', roomNo, 'roomlist');
  
      // Query the collection to get all documents
      const querySnapshot = await getDocs(roomlistCollectionRef);
  
      // Assuming there's only one document, get its reference
      const docRef = querySnapshot.docs[0].ref;
  
      // Retrieve the data from the document
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const documentData = docSnap.data();
  
        // Find the task with the specific ID
        const updatedListTasks = documentData.listTasks.map(task => {
          if (task.id === roomtask.id) {
            // Update the completed field of the task
            return { ...task, completed: !task.completed }; // Toggle the completed field
          }
          return task;
        });
  
        // Update the listTasks array in the document data
        const updatedDocumentData = { ...documentData, listTasks: updatedListTasks };
  
        // Write the updated data back to the Firestore document
        await updateDoc(docRef, updatedDocumentData);

        setCompleted(!completed);
  
        console.log('Task updated successfully');
      } else {
        console.log('Document does not exist');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  

  const handleClick = () => {
    if (!roomStarted) { // Check if the room is not started
      return; // Exit the function if room is not started
    }
    updateTaskCompletedField(); // Otherwise, proceed with updating the task completion field
  };

  return (
    <div>
      {/* Use roomtask instead of task */}
      <span style={{ textDecoration: completed ? 'line-through' : 'none' }} onClick={handleClick}>{roomtask.task}</span>
    </div>
  );
}

export default TaskListComponent;