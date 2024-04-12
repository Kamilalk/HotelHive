import "./CreateChat.css"; // Updated CSS import
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext"; // Updated context import
import { database } from "../../../firebase";
import { collection, query, where, onSnapshot, addDoc, Timestamp  } from "firebase/firestore";

const CreateChat = () => {
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;
    const [userProfiles, setUserProfiles] = useState([]);
    const [chatName, setChatName] = useState('');
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  
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

  const handleCheckboxChange = (id) => {
    if (selectedStaff.includes(id)) {
      setSelectedStaff(selectedStaff.filter(userId => userId !== id));
    } else {
      setSelectedStaff([...selectedStaff, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const chatId = generateRandomId();
      const chatCollectionRef = collection(database, 'Hotels', hotelId, 'Chats');
  
      
      const usersArray = [...selectedStaff];
  
      
      const docRef = await addDoc(chatCollectionRef, {
        chatName: chatName,
        createdAt: Timestamp.now(),
        chatUsers: usersArray
      });
  
      console.log('Chat created successfully:', chatName, usersArray);
      setShowSuccessPopup(true);
      
    
      setChatName('');
      setSelectedStaff([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };


  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 chat-input'>
      <form onSubmit={handleSubmit}>
        <p className='d-flex align-items-center justify-content-between chat-title'>Create a Chat</p>
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
        <button type="submit" className="form-btn">Create Chat</button>
      </form>
      {showSuccessPopup && (
          <div className="success-popup">
            <p>New Chat Made Successfully!</p>

          </div>
        )}
    </div>
  );
};

export default CreateChat;