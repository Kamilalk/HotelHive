import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { database } from "../../../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc , getDocs, deleteDoc, setDoc} from "firebase/firestore";
import { useParams } from 'react-router-dom';
import './EditChat.css';
import { useHistory } from "react-router-dom";

const EditChat = ( ) => {
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [userProfiles, setUserProfiles] = useState([]);
  const [chatName, setChatName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const history = useHistory();

  const { id } = useParams();
  const chatId = id;

  console.log("selectedStaff:", selectedStaff);



  useEffect(() => {
    const fetchStaffProfiles = async () => {
      const q = query(collection(database, "UserProfiles"), where("hotelId", "==", hotelId));
      onSnapshot(q, (querySnapshot) => {
        setUserProfiles(
          querySnapshot.docs.map(doc => ({
            id: doc.id,
            fullName: doc.data().fullName
          }))
        );
      });
    };
    fetchStaffProfiles();
  }, [hotelId]);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const chatDocRef = doc(database, `Hotels/${hotelId}/Chats`, chatId);
        const chatDocSnapshot = await getDoc(chatDocRef);
        if (chatDocSnapshot.exists()) {
          const chatData = chatDocSnapshot.data();
          setChatName(chatData.chatName);
          
          // Get the chatUsers directly from the chat document
          const chatUsers = chatData.chatUsers || []; // Ensure to handle the case when chatUsers field doesn't exist
          setSelectedStaff(chatUsers);
        } else {
          console.log("Chat document not found");
        }
      } catch (error) {
        console.error("Error fetching chat details:", error);
      }
    };
    fetchChatDetails();
  }, [chatId, hotelId]);

  const handleCheckboxChange = (id) => {
    if (selectedStaff.includes(id)) {
      // User the chat, so remove them
      setSelectedStaff(selectedStaff.filter(userId => userId !== id));
    } else {
      // User in the chat, so add them
      setSelectedStaff([...selectedStaff, id]);
    }
  };

  const handleDeleteChat = async () => {
    try {
      const chatDocRef = doc(database, `Hotels/${hotelId}/Chats/${chatId}`);
      await deleteDoc(chatDocRef);
      console.log('Chat deleted successfully:', chatId);
 
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const removeUsersFromChat = async (usersToRemove) => {
        try {
          // Iterate through each user ID to remove
          for (const userId of usersToRemove) {
            // Remove the userId from the chatUsers array
            const updatedChatUsers = selectedStaff.filter(id => id !== userId);
            await updateDoc(chatDocRef, { chatUsers: updatedChatUsers });
          }
        } catch (error) {
          console.error('Error removing users from chat:', error);
        }
      };
  
      const previousSelectedStaff = selectedStaff;
      const updatedChatUsers = selectedStaff.filter(userId => !previousSelectedStaff.includes(userId));
  
      const chatDocRef = doc(database, `Hotels/${hotelId}/Chats/${chatId}`);
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (chatDocSnapshot.exists()) {
        // Remove users from the chat
        await removeUsersFromChat(updatedChatUsers);
  
        // Update the chat document with the new chat name and updated chat users
        await updateDoc(chatDocRef, {
          chatName: chatName,
          chatUsers: selectedStaff
        });
  
        console.log('Chat updated successfully:', chatName, selectedStaff);
        setShowSuccessPopup(true);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };


  return (
    <div className='col-lg-6 col-md-6 col-sm-12 edit-chat-input'>
      <form onSubmit={handleSubmit}>
        <p className='d-flex align-items-center justify-content-between edit-chat-title'>Edit Chat</p>
        <div className='chat-container'>
          <label htmlFor="chatName" className="block input-label">Chat Name:</label>
          <input
            type="text"
            name="chatName"
            value={chatName}
            onChange={e => setChatName(e.target.value)}
            id="chatName"
            className="block w-full input-field"
            required
          />
          <label htmlFor="selectedStaff" className="block input-label">Choose staff in chat:</label>
          <div>
                    {userProfiles.map(user => (
            <div key={user.id}>
                <input
                type="checkbox"
                id={user.id}
                name="selectedStaff"
                checked={selectedStaff.includes(user.id)}
                onChange={() => handleCheckboxChange(user.id)}
                />
                <label htmlFor={user.id}>{user.fullName}</label>
            </div>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded form-btn">Update Chat</button>
        <button type="button" className="rounded form-btn" onClick={handleDeleteChat}>Delete Chat</button>
        <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
      </form>
      {showSuccessPopup && (
        <div className="success-popup">
          <p>Chat Updated Successfully!</p>
        </div>
      )}
    </div>
  );
};

export default EditChat;