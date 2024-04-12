import "./ChatComponent.css";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useStaffProfile } from "../../../../contexts/StaffProfileContext";
import { doc, getDoc } from "firebase/firestore";
import { database, auth } from "../../../../firebase";

const ChatComponent = ({id, name}) => {
    const [chatName, setChatName] = useState(name);
    const history = useHistory()
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;

    const handleChatClick = () => {
      const chatId = `/chats/${id}`;
      history.push(chatId);
    };

    useEffect(() => {
      // Check if chat name is not provided
      if (!name) {
          const fetchChatName = async () => {
              try {
                  // Fetch chat document from Firestore
                  const chatDocRef = doc(database, "Hotels", hotelId, "Chats", id);
                  const chatDocSnapshot = await getDoc(chatDocRef);

                  // If chat document exists, set chat name
                  if (chatDocSnapshot.exists()) {
                      const data = chatDocSnapshot.data();
                      setChatName(data.chatName || await getOtherUserName(data.chatUsers));
                  } else {
                      console.error("Chat not found:", id);
                  }
              } catch (error) {
                  console.error("Error fetching chat:", error);
              }
          };

          // Fetch chat name if not provided
          fetchChatName();
      }
  }, [id, name]);

  const getOtherUserName = async (chatUsers) => {
    const currentUserUid = auth.currentUser.uid;
    const otherUserId = chatUsers.find(userId => userId !== currentUserUid);
    if (otherUserId) {
        try {
            // Fetch user document from Firestore
            const userDocRef = doc(database, "UserProfiles", otherUserId);
            const userDocSnapshot = await getDoc(userDocRef);

            // If user document exists, return user's full name
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                return userData.fullName || otherUserId;
            } else {
                console.error("User profile not found for user ID:", otherUserId);
                return otherUserId;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return otherUserId;
        }
    } else {
        console.error("Other user ID not found in chat users:", chatUsers);
        return null;
    }
};


 
  return (
    <div onClick={handleChatClick}  className="mt-4 p-3 chat-card">
      <div className="d-flex justify-content-between">
        <p className="chat-name"> {chatName}</p>
      </div>

    </div>
  )
}

export default ChatComponent