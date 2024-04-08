import Register from './Register/Register'
import React from "react"
import { Container } from 'react-bootstrap'
import { AuthProvider } from '../contexts/AuthContexts'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './managerPages/Dashboard/Dashboard'
import Login from './Login/Login'
import PrivateRoute from './PrivateRoute';
import ForgotPassword from './ForgotPassword';
import MyProfile from './MyProfile';
import { StaffProfileProvider } from '../contexts/StaffProfileContext';
import MyTasks from './managerPages/MyTasks/MyTasks'
import RoomAssignments from './managerPages/RoomAssignments/RoomAssignments'
import RoomProfiles from './managerPages/RoomProfiles/RoomProfiles'
import Roster from './managerPages/Roster/Roster' 
import StaffProfiles from './managerPages/StaffProfiles/StaffProfiles'
import TrainingMode from './managerPages/TrainingMode/TrainingMode'
import AddStaff from './managerPages/StaffProfiles/AddStaff';
import AddRooms from './managerPages/RoomProfiles/AddRooms';
import CSVUpload from './managerPages/RoomProfiles/CsvUpload';
import Nav from './Nav/Nav';
import RoomProfilePage from './managerPages/RoomProfiles/RoomProfilePage';
import EditRoomProfile from './managerPages/RoomProfiles/EditRoomProfile';
import UpdateRoomAssignments from './managerPages/UpdateRoomAssignments/UpdateRoomAssignments';
import StaffProfilePage from './managerPages/StaffProfiles/StaffProfilePage';
import EditStaffProfile from './managerPages/StaffProfiles/EditStaffProfile';
import CreateChat from './Chats/CreateChat';
import ChatProfiles from './Chats/ChatProfiles';
import Chat from './Chats/Chat';
import EditRoster from './managerPages/Roster/RosterEdit';
import CreateTraining from './managerPages/TrainingMode/CreateTraining';
import TrainingProfile from './managerPages/TrainingMode/TrainingProfile';
import EditTrainingProfile from './managerPages/TrainingMode/EditTrainingProfile';
import EditChat from './Chats/EditChat';
import RoomLists from './managerPages/RoomProfiles/RoomLists/RoomLists';
import CreateRoomLists from './managerPages/RoomProfiles/RoomLists/CreateRoomLists';
import RoomListProfile from './managerPages/RoomProfiles/RoomLists/RoomListProfile';
import EditRoomList from './managerPages/RoomProfiles/RoomLists/EditRoomList';
import RoomAssignmentView from './managerPages/RoomAssignments/RoomAssignmentView';
import EditRoomAssignments from './managerPages/RoomAssignments/EditRoomAssignments';

function App() {
  return (
    <>
      {/* <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}> */}
      {/* <div className="w-100" style={{maxWidth: "400px"}}> */}
      <Router Router >
        <AuthProvider>
          <StaffProfileProvider>
          <Nav fixed="top" style={{ position: 'fixed', top: 0 }} />
            <Switch>
            
              <PrivateRoute exact path="/" component={Dashboard} />
              <PrivateRoute exact path="/MyProfile" component={MyProfile} />
              <PrivateRoute exact path="/managerPages/MyTasks" component={MyTasks} />
              <PrivateRoute exact path="/managerPages/RoomAssignments" component={RoomAssignments} />
              {/* <PrivateRoute exact path="/managerPages/RoomAssignments/Update" component={UpdateRoomAssignments} /> */}
              <PrivateRoute exact path="/managerPages/RoomProfiles" component={RoomProfiles} />
              <PrivateRoute exact path="/managerPages/Roster" component={Roster} />
              <PrivateRoute exact path="/managerPages/StaffProfiles" component={StaffProfiles} />
              <PrivateRoute exact path="/managerPages/TrainingMode" component={TrainingMode} />
              <PrivateRoute exact path="/managerPages/AddStaff" component={AddStaff} />
              <PrivateRoute exact path="/managerPages/AddRooms" component={AddRooms} />
              <PrivateRoute exact path="/managerPages/CSVUpload" component={CSVUpload} />
              <PrivateRoute path="/room/:roomNo" component={RoomProfilePage} />
              <PrivateRoute path="/editroomprofile/:roomNo" component={EditRoomProfile} />
              <PrivateRoute path="/StaffProfiles/staffProfile/:userId" component={StaffProfilePage} />
              <PrivateRoute exact path="/editstaffprofile/:userId" component={EditStaffProfile}/>
              <PrivateRoute exact path="/chats" component={ChatProfiles} />
              <PrivateRoute exact path="/chats/createchat" component={CreateChat}/>
              <PrivateRoute path="/chats/:id" exact component={Chat} />
              <PrivateRoute path="/roster/edit/:docid/:date" exact component={EditRoster} />
              <PrivateRoute path="/Training/CreateTraining" exact component={CreateTraining} />
              <PrivateRoute path="/Training/:id" exact component={TrainingProfile} />
              <PrivateRoute path="/edittrainingprofile/:id" exact component={EditTrainingProfile} />
              <PrivateRoute path="/chats/editchat/:id" exact component={EditChat} />
              <PrivateRoute path="/managerPages/RoomLists" exact component={RoomLists} />
              <PrivateRoute path="/roomlists/createroomlist" exact component={CreateRoomLists} />
              <PrivateRoute path="/roomlist/:id" exact component={ RoomListProfile} />
              <PrivateRoute path="/editroomlistprofile/:id" exact component={ EditRoomList} />
              <PrivateRoute path="/roomtaskView/:roomNo" exact component={ RoomAssignmentView } />
              <PrivateRoute path="/managerPages/EditRoomAssignments" exact component={ EditRoomAssignments } /> 
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
            </Switch>
          </StaffProfileProvider>
        </AuthProvider>
      </Router >
      {/* </div> */}
      {/* </Container > */}
    </>
  )
}

export default App;