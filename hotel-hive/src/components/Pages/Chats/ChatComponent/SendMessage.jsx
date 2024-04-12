import React, { useState, useEffect } from 'react';
import { database, auth, storage } from '../../../../firebase';
import { addDoc, collection, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
import { useStaffProfile } from '../../../../contexts/StaffProfileContext';
import './SendMessage.css';
import { ref, uploadBytes} from "firebase/storage";


const SendMessage = ({ scroll, id }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const { staffProfile } = useStaffProfile();
  const [chatUsers, setChatUsers] = useState([]);
  const [messageData, setMessageData] = useState({});
  const [chatData, setChatData] = useState(null);
  const displayName = staffProfile.fullName;
  const hotelId = staffProfile.hotelId;
  const uid = staffProfile.id;
  const chatId = id

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const chatDocRef = doc(database, `Hotels/${hotelId}/Chats/${chatId}`);
        console.log("Chat Doc Ref:", chatDocRef); // Log the chat document reference
        const chatDocSnapshot = await getDoc(chatDocRef);
        console.log("Chat Doc Snapshot:", chatDocSnapshot); // Log the chat document snapshot
        if (chatDocSnapshot.exists()) {
          const cData = chatDocSnapshot.data();
          console.log("Chat Data:", cData);
          setChatData(cData) // Log the chat data
          const users = cData.chatUsers || [];
          console.log("Chat Users:", users); // Log the chat users
          setChatUsers(users);
        }
      } catch (error) {
        console.error('Error fetching chat users:', error);
      }
    };
  
    fetchChatUsers();
  }, [hotelId, chatId]);
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const addMessageNotification = async (messageText) => {
    const notification = {
      title: `New Message ${chatData.chatName ? 'in: ' + chatData.chatName : 'from: ' + displayName}`,
      type: 'message',
      message: `New message from: ${displayName}`,
      description: messageText, // Set the message text as the description
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      info: { chatid: chatId}
    };
    try {
      // Loop through chat users and set notification for each user except the sender
      chatUsers.forEach(async (user) => {
        if (user !== uid) {
          const userDocRef = doc(database, 'UserProfiles', user);
          const notificationCollectionRef = collection(userDocRef, 'notifications');
          const notificationDocRef = doc(notificationCollectionRef);
          await setDoc(notificationDocRef, notification);
          console.log("Notification added for user: ", user);
        }
      });
    } catch (error) {
      console.error("Error adding notifications: ", error);
    }
  }


  const sendMessage = async (e) => {
    e.preventDefault();
    if (input === '') {
      alert('Please enter a valid message');
      return;
    }
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const uid = currentUser.uid;
        const messageRef = collection(database, `Hotels/${hotelId}/Chats/${chatId}/messages`);
  
        
        let messageData = {
          text: input,
          name: displayName,
          uid,
          timestamp: serverTimestamp(),
        };
  
        if (image) {
          const storageRef = ref(storage, `chats/${chatId}`);
          const imageId = generateImageId();
          const imageRef = ref(storageRef, imageId);
          try {
            await uploadBytes(imageRef, image);
            messageData.imageid = imageId; // Include imageUrl only if an image is uploaded
            console.log('Image uploaded successfully');
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }

        await addMessageNotification(messageData.text);
  
        await addDoc(messageRef, messageData);
        setInput('');
        setImage(null);

        scroll.current.scrollIntoView({ behavior: 'smooth' });
        
      } else {
        console.error('No user is currently authenticated.');

      }
    } catch (error) {
      console.error('Error sending message:', error.message);
  
    }
  }

  const generateImageId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  

    return (
        <form onSubmit={sendMessage} className="form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
            type='text'
            placeholder='Message'
          />
          
          <label className="button" style={{ textAlign: 'center' }}>
        <input
          type="file"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        Add Img
      </label>
          <button className="button" type='submit'>
            Send
          </button>
        </form>
      );
    };

export default SendMessage;