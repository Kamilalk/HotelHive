import UserNameChatComponent from "./ChatComponent/UserNameChatComponent";
import "./addChat.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext"
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, database} from "../../../firebase";
import { useHistory } from "react-router-dom";

const AddChat = () => {

  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;

  const history = useHistory();
  const currentUser = auth.currentUser;          
  const userId = currentUser.uid;
  const [userProfiles, setUserProfiles] = useState([]);


  useEffect(() => {
    const fetchStaffProfiles = async () => {
      const q = query(collection(database, "UserProfiles"), where("hotelId", "==", hotelid));
      onSnapshot(q, (querySnapshot) => {
        setUserProfiles(
          querySnapshot.docs
            .filter(doc => doc.id !== userId) 
            .map(doc => ({
              id: doc.id,
              fullName: doc.data().fullName
            }))
        );
      });
    };
    fetchStaffProfiles();
  }, [hotelid, userId]);
 

  return (
    <section className="p-5 chat-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 chat-title">Chats</p>
        <div className="d-flex">
        <button onClick={() => history.goBack()} className="rounded page-button">Back</button>
        </div>
      </div>

      <div className="row">
        {userProfiles.map((userProfile, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <UserNameChatComponent
              id={userProfile.id}
              name={userProfile.fullName}

            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default AddChat