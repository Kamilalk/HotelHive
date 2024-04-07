import React, { useState, useEffect } from "react";
import { Link, useHistory } from 'react-router-dom'
import Nav from '../../Nav/Nav'
import { database } from "../../../firebase";
import { getFirestore, collection, onSnapshot, addDoc, Timestamp, deleteDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
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
  const db = getFirestore();
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [users, setUsers] = useState([]);
  const [taskAssignee, setTaskAssignee] = useState("");
  const collectionRef = collection(database, "UserProfiles")

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'UserProfiles', userId, 'tasks'), (snapshot) => {
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

    // Cleanup function to unsubscribe from the snapshot listener when the component is unmounted
    return () => unsubscribe();
  }, [database, userId]);

  useEffect(() => {
    const q = query(collectionRef, where("hotelId", "==", hotelid));
    onSnapshot(q, (querySnapshot) => {
      setUsers(querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName
      })));
    });
  }, [collectionRef, hotelid]);

  const addTask = async (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName,
      description: taskDescription,
      assignee: taskAssignee,
      created: Timestamp.fromDate(new Date()),
      due: taskDue
    };
    try {
      const userDocRef = doc(database, 'UserProfiles', taskAssignee);
      const docRef = await addDoc(collection(userDocRef, 'tasks'), newTask)
      console.log("Document written with ID: ", docRef.id);
      setTaskName("");
      setTaskDescription("");
      setTaskDue("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(database, 'UserProfiles', userId, 'tasks', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const updateTask = async (id, updatedFields) => {
    try {
      await updateDoc(doc(database, 'UserProfiles', userId, 'tasks', id), updatedFields);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div>
      <div className="container mt-5" style={{ paddingTop: '75px', maxHeight: 'calc(100vh - 75px)', overflowY: 'auto' }}>
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group">
                  {tasks.map((task, index) => (
                    <li key={index} className="list-group-item">
                      {isEditing === task.id ? (
                        <div>
                          <label className="form-label">Task Name:</label>
                          <input type="text" defaultValue={task.name} onChange={e => updateTask(task.id, { name: e.target.value })} className="form-control mb-3" />
                          <label className="form-label">Description:</label>
                          <input type="text" defaultValue={task.description} onChange={e => updateTask(task.id, { description: e.target.value })} className="form-control mb-3" />
                          <label className="form-label">Due by:</label>
                          <input type="datetime-local" defaultValue={task.due} onChange={e => updateTask(task.id, { due: e.target.value })} className="form-control mb-3" />
                          <button onClick={() => setIsEditing(null)} className="btn btn-primary">Save</button>
                        </div>
                      ) : (
                        <div>
                          <h2>{task.name}</h2>
                          <p>{task.description}</p>
                          <p>Created on: {task.created.toDate().toLocaleDateString()}</p>
                          <p>Due by: {task.due.toLocaleString()}</p>
                          <button onClick={() => deleteTask(task.id)} className="btn btn-success me-2">Done</button>
                          <button onClick={() => setIsEditing(task.id)} className="btn btn-primary">Edit</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <form onSubmit={addTask}>
                  <div className="mb-3">
                    <label className="form-label">Task Name:</label>
                    <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} required className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description:</label>
                    <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} required className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign to:</label>
                    <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} required className="form-select">
                      {users.map((user, index) => (
                        <option key={index} value={user.id}>{user.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Due by:</label>
                    <input type="datetime-local" value={taskDue} onChange={e => setTaskDue(e.target.value)} required className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Task</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => history.goBack()} className="btn btn-secondary">Back</button>
    </div>
  );
}

export default MyTasks;


