import "./ChatComponent.css";
import React from "react";
import { useHistory } from "react-router-dom";

const ChatComponent = ({id, name}) => {

    const history = useHistory()

    const handleChatClick = () => {
      const chatId = `/chats/${id}`;
      history.push(chatId);
    };
 
  return (
    <div onClick={handleChatClick}  className="mt-4 p-3 chat-card">
      <div className="d-flex justify-content-between">
        <p className="chat-name"> {name}</p>
      </div>

    </div>
  )
}

export default ChatComponent