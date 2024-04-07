import React, { useState, useEffect, useRef } from 'react';
import Message from './ChatComponent/Message';
import SendMessage from './ChatComponent/SendMessage';
import { database } from '../../firebase';
import { query, collection, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { useStaffProfile } from '../../contexts/StaffProfileContext';
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
            const unsubscribe = onSnapshot(chatNameRef, (doc) => {
                if (doc.exists) {
                    const chatData = doc.data();
                    const chatName = chatData.chatName;
                    console.log("Chat Name:", chatName);
                    setChatName(chatName);
                } else {
                    console.log('Chat document does not exist');
                    setChatName('');
                }
            });
    
            return () => unsubscribe();
        }
    }, [id, hotelId]);

    return (
        <>
            <div className="chat-header">
                <h1>{chatName}</h1>
                <button onClick={handleEditChatClick}>Edit Chat</button>
            </div>

            <div>

            <main style={{ display: "flex", flexDirection: "column",  marginTop: "10px", marginBottom: "60px" }} >
                {messages &&
                    messages.map((message) => (
                        <Message key={message.id} message={message} chatId={id} />
                    ))}
            </main>
            </div>
            {/* Send Message Component */}
            <div style={{  position: "fixed", bottom: "0", width: "100%", backgroundColor: "white" }}>
                <SendMessage scroll={scroll} id={id} />
            </div>
            <span ref={scroll}></span>
        </>
    );
};

export default Chat;