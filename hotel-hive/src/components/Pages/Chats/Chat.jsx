import React, { useState, useEffect, useRef } from 'react';
import Message from './ChatComponent/Message';
import SendMessage from './ChatComponent/SendMessage';
import { database, auth } from '../../../firebase';
import { query, collection, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { useHistory } from 'react-router-dom';
import './Chat.css'

const Chat = ({match}) => {
    const [messages, setMessages] = useState([]);
    const [chatName, setChatName] = useState('');
    const scroll = useRef();
    const { id } = match.params;
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;
    const history = useHistory();
    const userRole = staffProfile.role;

    const handleEditChatClick = () => {
        history.push(`/chats/editchat/${id}`);
      };
    

    useEffect(() => {
        console.log('Chat ID:', id);
        if (id) {
            const q = query(
                collection(database, `Hotels/${hotelId}/Chats/${id}/messages`),
                orderBy('timestamp')
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let messages = [];
                querySnapshot.forEach((doc) => {
                    messages.push({ ...doc.data(), id: doc.id });
                });
                setMessages(messages);
            });
            return () => unsubscribe();
        }
    }, [id]);

    useEffect(() => {
        if (id && hotelId) {
            const chatNameRef = doc(database, `Hotels/${hotelId}/Chats/${id}`);
            const unsubscribe = onSnapshot(chatNameRef, async (doc) => {
                if (doc.exists) {
                    const chatData = doc.data();
                    const name = chatData.chatName;
                    if (!name) {
                        const otherUserName = await getOtherUserName(chatData.chatUsers);
                        setChatName(otherUserName || 'Unknown');
                    } else {
                        setChatName(name);
                    }
                } else {
                    console.log('Chat document does not exist');
                    setChatName('');
                }
            });

            return () => unsubscribe();
        }
    }, [id, hotelId]);

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
        <>
            <div className="chat-header">
                <h1>{chatName}</h1>
                {userRole === 'Manager' && <button onClick={handleEditChatClick} className='button'>Edit Chat</button>}
             <button onClick={() => history.goBack() } className='button' >Back</button>
            </div>

            <div>

            <main style={{ display: "flex", flexDirection: "column",  marginTop: "10px", marginBottom: "60px" }} >
                {messages &&
                    messages.map((message) => (
                        <Message key={message.id} message={message} chatId={id} />
                    ))}
            </main>
            </div>
            <div style={{  position: "fixed", bottom: "0", width: "100%", backgroundColor: "white" }}>
                <SendMessage scroll={scroll} id={id} />
            </div>
            <span ref={scroll}></span>
        </>
    );
};

export default Chat;