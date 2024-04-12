import "./MyTasksStaff.css";
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import { database } from "../../../firebase";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, query, where, setDoc} from 'firebase/firestore';
import { auth } from "../../../firebase"
import { useStaffProfile } from "../../../contexts/StaffProfileContext";

const MyTasksStaff = () => {
  const history = useHistory()
  const [tasks, setTasks] = useState([]);
  const userId = auth.currentUser.uid;
  const db = getFirestore();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const username = staffProfile.fullName;


  const handleSubmit = (taskid, name, description, id) => {
    const taskRef = doc(db, 'Hotels', hotelid, 'tasks', taskid);
    deleteDoc(taskRef);
    addTaskCompleteNotification(taskid, name, description, id);
  };


  useEffect(() => {
    console.log(username);
    const q = query(collection(db, 'Hotels', hotelid, 'tasks'), where('assignee', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedTasks = fetchedTasks.map(task => {
        return {
          ...task,
          due: new Date(task.due)  // Convert string to JavaScript Date
        };
      });
      fetchedTasks.sort((a, b) => a.due - b.due); // Sort tasks by due date
      setTasks(fetchedTasks);
    });
  

    return () => unsubscribe();
  }, [db, userId, hotelid]);


  const addTaskCompleteNotification = async (id, name, description, assignedById) => {
    const notification = {
      title: `Task Completed: ${name}`,
      type: 'task',
      message: `Task completed by ${username}`,
      description: description,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      info: {}
    };
  
    try {
    
      // Construct the document reference for the user's notifications
      const userDocRef = doc(database, 'UserProfiles', assignedById);
      const notificationDocRef = doc(userDocRef, 'notifications', id);
    
      // Set the notification document for the specific user
      await setDoc(notificationDocRef, notification);
    
      console.log("Notification document added successfully");
    } catch (error) {
      console.error("Error adding notification document:", error);
    }
  };


  return (
    <div className="col-lg-4 col-md-6 col-sm-12 tasks-pagestaff">
        <h2 style={{color: '#d969dc'}}>My Tasks</h2>
        <button onClick={() => history.goBack()} className="rounded submit-button">Back</button>
      <div className="flex-nowrap align-items-center justify-content-between">
        {tasks.map((task, index) => (
          <div key={index} className="task-cardstaff">
            <p className="task-namestaff">{task.name}</p>
            <div className="task-card-div1staff">
              <p className="task-due-datestaff"> Task Due By: {task.due.toLocaleString()}</p>
              <p className="task-due-datestaff"> Assigned By: {task.assignedByName}</p>
            </div>
            <div className="task-descriptionstaff">{task.description}</div>
            <button onClick={() => handleSubmit(task.id, task.name, task.description, task.assignedBy) } className="rounded submit-button">Task Complete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyTasksStaff