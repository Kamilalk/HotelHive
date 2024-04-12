import "./MyTasks.css";
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import { database } from "../../../firebase";
import {  collection, onSnapshot, addDoc, Timestamp, deleteDoc, doc, updateDoc, query, where, setDoc, getDoc } from 'firebase/firestore';
import { auth } from "../../../firebase"
import { useStaffProfile } from "../../../contexts/StaffProfileContext";

const MyTasks = () => {
  const history = useHistory()
  const [isEditing, setIsEditing] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const userId = auth.currentUser.uid;
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [users, setUsers] = useState([]);
  const [taskAssignee, setTaskAssignee] = useState("");
  const collectionRef = collection(database, "UserProfiles")
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [editedTaskDescription, setEditedTaskDescription] = useState("");
  const [editedTaskDue, setEditedTaskDue] = useState("");
  const [editedTaskAssignee, setEditedTaskAssignee] = useState("");
  const name = staffProfile.fullName;


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'Hotels', hotelid, 'tasks'), (snapshot) => {
      let fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedTasks = fetchedTasks.map(task => {
        return {
          ...task,
          due: new Date(task.due)  
        };
      });
      fetchedTasks.sort((a, b) => a.due - b.due); // Sort tasks by due date
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [database, userId]);

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
    setEditedTaskDescription(task.description);
    setEditedTaskDue(task.due.toISOString().substring(0, 16));; // Convert to yyyy-mm-dd format
    setEditedTaskAssignee(task.assignee);
  };

  useEffect(() => {
    const q = query(collectionRef, where("hotelId", "==", hotelid));
    onSnapshot(q, (querySnapshot) => {
      setUsers(querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName
      })));
    });
  }, [collectionRef, hotelid]);

  const handleUserSelect = (e) => {
    setTaskAssignee(e.target.value);
  };

  const addTask = async (e) => {
    e.preventDefault();
  
  
    const newTask = {
      name: taskName,
      description: taskDescription,
      assignee: taskAssignee,
      created: Timestamp.fromDate(new Date()),
      due: taskDue,
      assignedBy: userId,
      assignedByName: name
    };
  
    try {
      const userDocRef = doc(database, 'Hotels', hotelid);
      const docRef = await addDoc(collection(userDocRef, 'tasks'), newTask);
      await addTaskNotification(newTask, docRef.id);
      console.log("Document written with ID: ", docRef.id);
      setTaskName("");
      setTaskDescription("");
      setTaskDue("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const addTaskNotification = async (task, id) => {

    const notification = {
      title: `Task : ${task.name} `,
      type: 'task',
      message: 'task due by' + task.due.toLocaleString(),
      description: task.description,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      info: { due: task.due, taskAssignee: task.assignee, givenBy: name, givenId: userId}
    };
    try {
      const userDocRef = doc(database, 'UserProfiles', task.assignee);
      const notificationDocRef = doc(collection(userDocRef, 'notifications'), id);
      await setDoc(notificationDocRef, notification);
      console.log("Document written with ID: ", id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  const deleteTask = async (id, assignee) => {
    try {
      await deleteDoc(doc(database, 'Hotels', hotelid, 'tasks', id));
      await deleteDoc(doc(database, 'UserProfiles', assignee, 'notifications', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };


  const updateTask = async (id, updatedFields) => {
    try {
      const currentAssigneeId = await getAssigneeId(id);
      const taskRef = doc(database, 'Hotels', hotelid, 'tasks', id);
      await updateDoc(taskRef, updatedFields);
  
      // Check if the assignee of the task has been changed
      if (updatedFields.assignee !== currentAssigneeId) {
        // Fetch the updated task
        const updatedTaskSnapshot = await getDoc(taskRef);
        const updatedTask = updatedTaskSnapshot.data();

        // Create a new notification for the new assignee
        const newAssigneeNotification = {
          title: `New Task : ${updatedTask.name}`,
          type: 'task',
          message: `Task due by ${updatedTask.due.toLocaleString()}`,
          description: updatedTask.description,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          info: { due: updatedTask.due, taskAssignee: updatedTask.assignee, givenBy: name, givenId: userId}
        };

        // Add the new notification to the new assignee's notifications
        const newAssigneeNotificationDocRef = doc(database, 'UserProfiles', updatedFields.assignee, 'notifications', id);
        await setDoc(newAssigneeNotificationDocRef, newAssigneeNotification);
        console.log("New Assignee Notification created successfully");
        
      } else {
        // If the assignee has changed, perform specific actions here
        console.log("Assignee has changed, performing specific actions...");

        // Fetch the updated task
        const updatedTaskSnapshot = await getDoc(taskRef);
        const updatedTask = updatedTaskSnapshot.data();
      
        // Update the corresponding notification
        const notificationDocRef = doc(database, 'UserProfiles', currentAssigneeId, 'notifications', id); 
        const notificationSnapshot = await getDoc(notificationDocRef);
        console.log("Updated Notification:", notificationSnapshot);
        if (notificationSnapshot.exists()) {
          const updatedNotification = {
            ...notificationSnapshot.data(),
            title: `Updated  : ${updatedTask.name}`,
            message: `Task due by ${updatedTask.due.toLocaleString()}`,
            description: updatedTask.description,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            info: { due: updatedTask.due, taskAssignee: updatedTask.assignee, givenBy: name, givenId: userId}
          };
          await updateDoc(notificationDocRef, updatedNotification);
          console.log("Notification updated successfully");
        }
      }
      const oldAssigneeNotificationDocRef = doc(database, 'UserProfiles', currentAssigneeId, 'notifications', id);
      const oldAssigneeNotificationSnapshot = await getDoc(oldAssigneeNotificationDocRef);
      console.log("Old Assignee Notification:", oldAssigneeNotificationSnapshot);
      if (oldAssigneeNotificationSnapshot.exists()) {
        // Delete the notification for the old assignee
        await deleteDoc(oldAssigneeNotificationDocRef);
        console.log("Old Assignee Notification deleted successfully");
      
      } else {
        console.log("Assignee remains the same");
      }

  
      console.log("Document updated successfully");
      setEditingTaskId(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const getAssigneeId = async (taskId) => {
    try {
      // Retrieve the task document
      const taskRef = doc(database, 'Hotels', hotelid, 'tasks', taskId);
      const taskSnapshot = await getDoc(taskRef);
      
      if (taskSnapshot.exists()) {
        // Get the assignee's user ID from the task document
        const assigneeUserId = taskSnapshot.data().assignee;
        
        return assigneeUserId;
      } else {
        console.log("Task document doesn't exist");
        return null;
      }
    } catch (error) {
      console.error("Error fetching assignee ID: ", error);
      return null;
    }
  };

  return (
    <div>
      <section className="row p-5 tasks-page">
        <div className="col-lg-2"></div>
        <div className="col-lg-4 col-md-6 col-sm-12 task-container">
          <div className="d-flex align-items-center justify-content-between">
            <p className="task-title">Tasks</p>
            <select
              value={taskAssignee}
                onChange={handleUserSelect}
                required
                className="tasks-custom-select"
              >
                <option value="">Select User</option>
                {users.map((user, index) => (
                    <option key={index} value={user.id}>{user.fullName}</option>
                ))}
            </select>
          </div>
          <div className="tasks-container-scrollable">
          {taskAssignee === "all" && tasks.map((task, index) => (
            <div key={index} className="task-card">
              {editingTaskId === task.id ? (
                <div>
                  <p className="task-name">Edit Task</p>
                  <div className="task-card-div1">
                    <p className="task-name">
                      <input value={editedTaskName} onChange={(e) => setEditedTaskName(e.target.value)} />
                    </p>
                    <p className="task-due-date">
                      <input value={editedTaskDescription} onChange={(e) => setEditedTaskDescription(e.target.value)} />
                    </p>
                    </div>
                      <input type="date" value={editedTaskDue} onChange={(e) => setEditedTaskDue(e.target.value)} />

                      <select value={editedTaskAssignee} onChange={(e) => setEditedTaskAssignee(e.target.value)}>
                        <option value="">Select User</option>
                        {users.map((user, index) => (
                          <option key={index} value={user.id}>{user.fullName}</option>
                        ))}
                      </select>
                    <div className="task-buttons-container">
                      <button className="task-edit" onClick={() => updateTask(task.id, { name: editedTaskName, description: editedTaskDescription, due: editedTaskDue, assignee: editedTaskAssignee })}>Save</button>
                      <button className="task-edit" onClick={() => setEditingTaskId(null)}>Cancel</button>
                    </div>
                </div>
              ) : (
                <div>
                  <p className="task-name">{task.name}</p>
                  <div className="task-card-div1">
                    <p className="task-name">
                      {users.find(user => user.id === task.assignee)?.fullName} 
                    </p>
                    <p className="task-due-date">
                      {task.due.toLocaleString()}
                    </p>
                  </div>
                  <div className="task-description">
                    {task.description}
                  </div>
                  <div className="task-created-date">
                    <span>{task.created.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="task-buttons-container">
                    <button className="task-edit" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="task-done" onClick={() => deleteTask(task.id, task.assignee)}>Done</button>
                  </div>
                </div>
              )}
            </div>
          ))}
            {taskAssignee !== "all" && tasks.filter(task => task.assignee === taskAssignee).map((task, index) => (
                          <div key={index} className="task-card">
                          {editingTaskId === task.id ? (
                            <div>
                              <p className="task-name">Edit Task</p>
                              <div className="task-card-div1">
                                <p className="task-name">
                                  <input value={editedTaskName} onChange={(e) => setEditedTaskName(e.target.value)} />
                                </p>
                                <p className="task-due-date">
                                  <input value={editedTaskDescription} onChange={(e) => setEditedTaskDescription(e.target.value)} />
                                </p>
                                </div>
                                  <input type="task-date" value={editedTaskDue} onChange={(e) => setEditedTaskDue(e.target.value)} />
            
                                  <select value={editedTaskAssignee} onChange={(e) => setEditedTaskAssignee(e.target.value)}>
                                    <option value="">Select User</option>
                                    {users.map((user, index) => (
                                      <option key={index} value={user.id}>{user.fullName}</option>
                                    ))}
                                  </select>
                                <div className="task-buttons-container">
                                  <button className="task-edit" onClick={() => updateTask(task.id, { name: editedTaskName, description: editedTaskDescription, due: editedTaskDue, assignee: editedTaskAssignee })}>Save</button>
                                  <button className="task-done" onClick={() => setEditingTaskId(null)}>Cancel</button>
                                </div>
                            </div>
                          ) : (
                            <div>
                              <p className="task-name">{task.name}</p>
                              <div className="task-card-div1">
                                <p className="task-name">
                                  {users.find(user => user.id === task.assignee)?.fullName} 
                                </p>
                                <p className="task-due-date">
                                  {task.due.toLocaleString()}
                                </p>
                              </div>
                              <div className="task-description">
                                {task.description}
                              </div>
                              <div className="task-created-date">
                                <span>{task.created && typeof task.created.toDate === 'function' ? task.created.toDate().toLocaleDateString() : 'Unknown Date'}</span>
                              </div>
                              <div className="task-buttons-container">
                                <button className="task-edit" onClick={() => handleEdit(task)}>Edit</button>
                                <button className="task-done" onClick={() => deleteTask(task.id, task.assignee)}>Done</button>
                              </div>
                            </div>
                          )}
                        </div>
            ))}
          </div>
        </div>
        

        <div className="col-lg-3 col-md-6 col-sm-12 task-form">
          <form onSubmit={addTask}>
            <p className="d-flex align-items-center justify-content-center mt-3 task-title">Create A <br /> Task</p>
            <div className="task-form-container">
              <label for="taskname" class="block task-input-label">Task Name:</label>
              <input
                type="text"
                name="taskname"
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                id="taskname"
                class="block w-full input-field"
                required
              />
              <label for="taskdescription" class="block task-input-label">Task Description:</label>
              <textarea
                type="textarea"
                name="taskdescription"
                value={taskDescription} 
                onChange={e => setTaskDescription(e.target.value)}
                id="taskdescription"
                class="block w-full input-field"
                required
              ></textarea>

              <label for="taskassignto" class="block task-input-label">Assign Task To:</label>
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Select User</option>
                {users.map((user, index) => (
                  <option key={index} value={user.id}>{user.fullName}</option>
                ))}
              </select>

              <label for="taskdueby" class="block task-input-label">Task Due By:</label>
              <input
                type="datetime-local"
                name="taskdueby"
                value={taskDue} 
                onChange={e => setTaskDue(e.target.value)}
                id="taskdueby"
                class="block w-full input-field"
                required
              />

              <button  type="task-submit" className="form-btn">Add Task</button>
            </div>
          </form>
        </div>

        <div className="col-lg-2"></div>
      </section>
    </div>
  )
}

export default MyTasks