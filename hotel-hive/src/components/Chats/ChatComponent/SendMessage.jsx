import React, { useState } from 'react';
import { database, auth, storage } from '../../../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import './SendMessage.css';
import { ref, uploadBytes, getDownloadURL, child} from "firebase/storage";


const SendMessage = ({ scroll, id }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const { staffProfile } = useStaffProfile();
  const displayName = staffProfile.fullName;
  const hotelId = staffProfile.hotelId;
  const uid = staffProfile.id;
  const chatId = id

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };


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
  
        await addDoc(messageRef, messageData);
        setInput('');
        setImage(null);
        scroll.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('No user is currently authenticated.');
        // Handle the case when no user is authenticated
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      // Handle error state here if needed
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