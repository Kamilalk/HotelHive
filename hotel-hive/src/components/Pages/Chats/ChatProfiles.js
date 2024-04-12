import ChatComponent from "./ChatComponent/ChatComponent";
import "./ChatProfiles.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext"
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, database} from "../../../firebase";
import { useHistory } from "react-router-dom";



const ChatProfiles = () => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [chats, setChats] = useState([  ]);
  const history = useHistory();
  const currentUser = auth.currentUser;          
  const userId = currentUser.uid;
  const role = staffProfile.role;

  const handleCreateGroupChatClick = () => {
      history.push("/chats/createchat");
  }

  const handleCreateChatClick = () => {
    history.push("/addchat");
  }

  useEffect(() => {
    const fetchChats = async () => {
      console.log('hotelid:', hotelid);
      console.log('userId:', userId);
  
      if (!hotelid || !userId) return;
  
      try {
        const q = query(collection(database, "Hotels", hotelid, "Chats"), where("chatUsers", "array-contains", userId));
        onSnapshot(q, (querySnapshot) => {
          const chatDocs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
  
          console.log('chatDocs:', chatDocs);
  
          setChats(chatDocs);
        });
      } catch (error) {
        console.error('Error fetching chats:', error); // Add this line
      }
    };
    fetchChats();
  }, [hotelid, userId]);


  return (
    <section className="p-5 chat-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 chat-title">Chats</p>
        <div className="d-flex">
        <button
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
            onClick={handleCreateChatClick}
          >
            New Chat
          </button>
          {role === 'Manager' && <button onClick={handleCreateGroupChatClick} className='rounded text-black d-flex align-items-center justify-content-between page-button'>New Group Chat</button>}
          <button onClick={() => history.goBack()} className="rounded text-black d-flex align-items-center justify-content-between page-button">Back</button>
        </div>
      </div>

      <div className="row">
        {chats.map((chat, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <ChatComponent
              id={chat.id}
              name={chat.chatName}

            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default ChatProfiles