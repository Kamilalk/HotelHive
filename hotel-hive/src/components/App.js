import Register from './Pages/Register/Register'
import React from "react"
import { AuthProvider } from '../contexts/AuthContexts'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './Pages/Dashboard/Dashboard'
import Login from './Pages/Login/Login'
import PrivateRoute from './PrivateRoute';
import { StaffProfileProvider } from '../contexts/StaffProfileContext';
import MyTasks from './Pages/Tasks/MyTasks'
import RoomAssignments from './Pages/RoomAssignments/RoomAssignments'
import RoomProfiles from './Pages/RoomProfiles/RoomProfiles'
import Roster from './Pages/Roster/Roster' 
import StaffProfiles from './Pages/StaffProfiles/StaffProfiles'
import TrainingMode from './Pages/Training/TrainingMode'
import AddStaff from './Pages/StaffProfiles/AddStaff';
import AddRooms from './Pages/RoomProfiles/AddRooms';
import CSVUpload from './Pages/RoomProfiles/CsvUpload';
import Nav from './Nav/Nav';
import RoomProfilePage from './Pages/RoomProfiles/RoomProfilePage';
import EditRoomProfile from './Pages/RoomProfiles/EditRoomProfile';
import StaffProfilePage from './Pages/StaffProfiles/StaffProfilePage';
import EditStaffProfile from './Pages/StaffProfiles/EditStaffProfile';
import CreateChat from './Pages/Chats/CreateChat';
import ChatProfiles from './Pages/Chats/ChatProfiles';
import Chat from './Pages/Chats/Chat';
import EditRoster from './Pages/Roster/RosterEdit';
import CreateTraining from './Pages/Training/CreateTraining';
import TrainingProfile from './Pages/Training/TrainingProfile';
import EditTrainingProfile from './Pages/Training/EditTrainingProfile';
import EditChat from './Pages/Chats/EditChat';
import RoomLists from './Pages/RoomProfiles/RoomLists/RoomLists';
import CreateRoomLists from './Pages/RoomProfiles/RoomLists/CreateRoomLists';
import RoomListProfile from './Pages/RoomProfiles/RoomLists/RoomListProfile';
import EditRoomList from './Pages/RoomProfiles/RoomLists/EditRoomList';
import RoomAssignmentProfile from './Pages/RoomAssignments/RoomAssignmentProfile';
import EditRoomAssignments from './Pages/RoomAssignments/EditRoomAssignments';
import MyProfilePage from './Pages/MyProfile/MyProfilePage';
import EditMyProfile from './Pages/MyProfile/EditMyProfile';
import AddChat from './Pages/Chats/addChat';
import MyTasksStaff from './Pages/Tasks/MyTasksStaff';
import AlertStaff from './Pages/RoomAssignments/AlertStaff';

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
              <PrivateRoute exact path="/MyTasks" component={MyTasks} />
              <PrivateRoute exact path="/RoomAssignments" component={RoomAssignments} />
              <PrivateRoute exact path="/RoomProfiles" component={RoomProfiles} />
              <PrivateRoute exact path="/Roster" component={Roster} />
              <PrivateRoute exact path="/StaffProfiles" component={StaffProfiles} />
              <PrivateRoute exact path="/TrainingMode" component={TrainingMode} />
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
              <PrivateRoute path="/roomtaskView/:roomNo" exact component={ RoomAssignmentProfile } />
              <PrivateRoute path="/managerPages/EditRoomAssignments" exact component={ EditRoomAssignments } /> 
              <PrivateRoute path="/myprofile/:userId" exact component={ MyProfilePage } />
              <PrivateRoute path="/editmyprofile/:userId" exact component={ EditMyProfile } />
              <PrivateRoute path="/addchat" exact component={ AddChat } />
              <PrivateRoute path="/mytasksstaff" exact component={ MyTasksStaff } />
              <PrivateRoute path="/alertstaff/:roomNo/:assigneeid" exact component={ AlertStaff } />
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
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