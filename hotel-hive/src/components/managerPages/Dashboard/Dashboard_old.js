import React from "react";
import { Link } from "react-router-dom";

const Dashboard_old = () => {
  return (
    <div className="d-none" style={{ display: 'flex' }}>
      {/* Left Section (Notification Center) */}
      <div style={{ flex: 1, borderRight: '1px solid #ccc', padding: '20px' }}>
        {/* Add Notification Center component here */}
        <h2 style={{ marginTop: '30px' }}>Notification Center</h2>
        {/* Placeholder for future development */}
      </div>

      {/* Right Section (Control Center) */}
      <div style={{ flex: 3, padding: '20px' }}>
        <h2 style={{ marginTop: '30px' }}>Control Center</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li>
            <Link to="/MyProfile" onClick={() => history.push('/MyProfile')}>My Profile</Link> (View/Edit)
          </li>
          <li>
            <Link to="/managerPages/RoomAssignments" onClick={() => history.push('/managerPages/RoomAssignments')}>Room Assignments</Link> (View/Edit)
          </li>
          <li>
            <Link to="/managerPages/Roster" onClick={() => history.push('/managerPages/Roster')}>Roster</Link> (View/Edit/Create)
          </li>
          <li>
            <Link to="/managerPages/RoomProfiles" onClick={() => history.push('/managerPages/RoomProfiles')}>Room Profiles</Link> (View/Edit/Create)
          </li>
          <li>
            <Link to="/manager/chats" onClick={() => history.push('/manager/chats')}>Chats</Link> (View/Edit/Create)
          </li>
          <li>
            <Link to="/managerPages/MyTasks" onClick={() => history.push('/managerPages/MyTasks')}>My Tasks</Link> (View/Edit)
          </li>
          <li>
            <Link to="/managerPages/StaffProfiles" onClick={() => history.push('/managerPages/StaffProfiles')}>Staff Profiles</Link> (View/Edit/Create)
          </li>
          <li>
            <Link to="/managerPages/TrainingMode" onClick={() => history.push('/managerPages/TrainingMode')}>Training Mode</Link> (View/Edit/Create)
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard_old