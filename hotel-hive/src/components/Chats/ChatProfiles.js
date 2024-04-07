import ChatComponent from "./ChatComponent/ChatComponent";
import "./ChatProfiles.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../contexts/StaffProfileContext"
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { database } from "../../firebase";
import { useHistory } from "react-router-dom";



const ChatProfiles = () => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [chats, setChats] = useState([]);
  const history = useHistory();


  const handleCreateChatClick = () => {
    history.push("/chats/createchat");
  };


  useEffect(() => {
    const fetchChats = async () => {
      const q = query(collection(database, "Hotels", hotelid, "Chats"));
      onSnapshot(q, (querySnapshot) => {
        setChats(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    };
    fetchChats();
  }, []);


  return (
    <section className="p-5 chat-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 chat-title">Staff Profiles</p>
        <div className="d-flex">
        <button
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
            onClick={handleCreateChatClick}
          >
            Create New Chat
          </button>
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