import "./UserNameChatComponent.css";
import React from "react";
import { useHistory } from "react-router-dom";
import { auth, database } from "../../../../firebase";
import { useStaffProfile } from "../../../../contexts/StaffProfileContext";
import { collection, query, where, getDocs, addDoc} from "firebase/firestore";

const UserNameChatComponent = ({id, name}) => {

    const history = useHistory()
    const currentUser = auth.currentUser;         
    const userId = currentUser.uid;
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;


    const handleChatClick = async () => {
      try {
    
        const chatsRef = collection(database, "Hotels", hotelId, "Chats");
        const userChatQuery = query(
          chatsRef,
          where("chatUsers", "==", [userId, id])
        );
  
        const querySnapshot = await getDocs(userChatQuery);
  
        //If a chat between the two users exists navigate to that chat
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            history.push(`/chats/${doc.id}`);
          });
        } else {
          //If no existing chat create a new chat between the two users
          const newChatRef = await addDoc(chatsRef, {

            createdAt: new Date(),
            chatUsers: [userId, id],
          });
          history.push(`/chats/${newChatRef.id}`);
        }
      } catch (error) {
        console.error("Error handling chat click:", error);
      }
    };
  

  return (
    <div onClick={handleChatClick}  className="mt-4 p-3 chat-card">
      <div className="d-flex justify-content-between">
        <p className="chat-name"> {name}</p>
      </div>

    </div>
  )
}

export default UserNameChatComponent