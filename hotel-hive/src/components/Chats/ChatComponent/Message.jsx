import React, { useEffect, useState } from 'react';
import { auth, storage } from '../../../firebase';
import './Message.css'; // Import your CSS file
import { ref, getDownloadURL } from 'firebase/storage';

const Message = ({ message, chatId }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const messageClass =
        message.uid === auth.currentUser.uid
            ? 'msgsent'
            : 'msgreceived';

        useEffect(() => {
            if (message.imageid) {
                // Get the image URL from storage using the imageId
                const imageRef = ref(storage, `chats/${chatId}/${message.imageid}`);
                getDownloadURL(imageRef)
                    .then(url => {
                        setImageUrl(url);
                        console.log('Image URL:', url);
                    })
                    .catch(error => {
                        console.error('Error fetching image:', error);
                    });
                }
            }, [message.imageid, chatId]);

    return (
        <div className="msgmessage">
            <div className={messageClass}>
                <p className='msgname'>{message.name}</p>
                <p>{message.text}</p>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Message Image"
                        className='img'

                    />
                )}
            </div>
        </div>
    );
};

export default Message;