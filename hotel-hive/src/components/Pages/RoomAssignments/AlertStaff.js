import { useParams } from 'react-router-dom';
import { auth, database, storage } from '../../../firebase';
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { collection, addDoc, getDocs, doc, serverTimestamp, Timestamp, query, where  } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { format, startOfWeek } from 'date-fns';
import './AlertStaff.css';
import { useHistory } from "react-router-dom";
import { ref, uploadBytes} from 'firebase/storage';

function AlertStaff(){
    const { roomNo, assigneeid } = useParams();
    const [userProfiles, setUserProfiles] = useState([]);
    const today = new Date("2024-03-06");
    const WeekStartDate = startOfWeek(today);
    const formatedDate = format(today, 'yyyy-MM-dd');
    const formatedWeekStartDate = format(WeekStartDate, 'yyyy-MM-dd');
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;
    const history = useHistory();
    const [staffRole, setStaffRole] = useState('');
    const [userName, setUserName] = useState('');
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [userProfile, setUserProfile] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const currentUserID = auth.currentUser.uid;
    const role = staffProfile.role;
  

    useEffect(() => {
        const fetchUserProfiles = async () => {
          try {
            const rosterCollectionRef = collection(database, `Hotels/${hotelId}/roster/${formatedWeekStartDate}/${formatedDate}`);
            const querySnapshot = await getDocs(rosterCollectionRef);
            const profiles = querySnapshot.docs.map(doc => doc.data());
            setUserProfiles(profiles);
            const foundUserProfile = findUserProfileById(assigneeid);
            setName(foundUserProfile.name);
          } catch (error) {
            console.error('Error fetching user profiles:', error);

          }
        };
      
        fetchUserProfiles(); 
      }, [hotelId, formatedWeekStartDate, formatedDate]);

      const findUserProfileById = (userId) => {
        const userProfile = userProfiles.find(profile => profile.userid === userId);
        return userProfile || {}; 
    };

      const handleSubmit = async (e) => {
        e.preventDefault();

        const foundUserProfile = findUserProfileById(assigneeid);
        console.log("Found user profile:", foundUserProfile);
        
      
        setUserProfile(foundUserProfile);
        console.log("User Profile:", userProfile);
        console.log("User Profile ID:", userProfile.userid);
        await sendNotification();
        await submitTask();
        await sendMessage();
        setSuccessMessage('Alert Sent successfully!');
      }

      const sendNotification = async () => { 

        const notification = {
            title: 'Request',
            type: 'task',
            message: `Presence Requested in Room ${roomNo}`,
            description: text + 'for more information look in messages or tasks',
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            info: { assignedby : currentUserID}
        };
    
        try {
            const id = userProfile.userid;
      
            const userDocRef = doc(database, 'UserProfiles', id);

            const notificationCollectionRef = collection(userDocRef, 'notifications');
      
            await addDoc(notificationCollectionRef, notification);
            console.log("Notification sent successfully!");
        } catch (error) {
            console.error("Error sending notification: ", error);
        }
    }


  const submitTask = async () => {

      const newTask = {
        name: 'request in room ' + roomNo,
        description: text,
        assignee: userProfile.userid, 
        created: Timestamp.fromDate(new Date()), 
        due: null, 
        assignedBy: currentUserID,
      };

      console.log('task:', newTask);

    
      try {
        const userDocRef = doc(database, 'Hotels', hotelId);
        const docRef = await addDoc(collection(userDocRef, 'tasks'), newTask);
        console.log("Document written with ID: ", docRef.id);

      } catch (error) {
        console.error("Error adding document: ", error);
      }
  };


  const sendMessage = async () => {
    try {

        const uid = auth.currentUser.uid;
        const name = staffProfile.fullName;
        const chatId = await findChat(uid, userProfile.userid);
        const messageRef = collection(database, `Hotels/${hotelId}/Chats/${chatId}/messages`);
  
        
        let messageData = {
          text: text,
          name: name,
          uid : uid,
          timestamp: serverTimestamp(),
        };
  
        if (image) {
          const storageRef = ref(storage, `chats/${chatId}`);
          const imageId = generateImageId();
          const imageRef = ref(storageRef, imageId);
          try {
            await uploadBytes(imageRef, image);
            messageData.imageid = imageId;
            console.log('Image uploaded successfully');
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }

  
        await addDoc(messageRef, messageData);
        console.log('Message sent successfully');
        setImage(null);

    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }

  const generateImageId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const findChat = async (userId, id) => {
    try {
        const chatsRef = collection(database, `Hotels/${hotelId}/Chats`);
        const userChatQuery = query(
            chatsRef,
            where("chatUsers", "==", [userId, id])
        );

        const querySnapshot = await getDocs(userChatQuery);

  
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        } else {
            // If no chat was found, create a new chat
            const newChatRef = await addDoc(chatsRef, {
                createdAt: new Date(),
                chatUsers: [userId, id]
            });
            return newChatRef.id; 
        }
    } catch (error) {
        console.error("Error finding or creating chat:", error);
     
        return null;
    }
};

const handleImageChange = (event) => {
  const selectedImage = event.target.files[0]; 
  setImage(selectedImage);
};


 return(
    <div className='col-lg-6 col-md-6 col-sm-12 alert-input'>
    <form onSubmit={handleSubmit}>
      <p className='d-flex align-items-center justify-content-between alert-title'>Send Alert</p>
      <p className='d-flex align-items-center justify-content-between alert-title'>currently in room {roomNo} assigned to {name} </p>
      <div className='input-container'>
        <label htmlFor="staffRole" className="block input-label">Staff Role:</label>
        <select
            name="staffRole"
            value={staffRole}
            onChange={e => setStaffRole(e.target.value)}
            id="staffRole"
            className="block w-full input-field"
            required
            >
            <option value="">Select Staff Role</option>
            <option value="Manager">Manager</option>
            {role !== "Supervisor" && (
                <option value="Supervisor">Supervisor</option>
            )}
            {role !== "Housekeeper" &&(
            <option value="Housekeeper">Housekeeper</option>
            )}
            <option value="Handyman">Handyman</option>
            <option value="Porter">Porter</option>
            </select>

                {staffRole && (
                        <div>
                            <label htmlFor="userName" className="block input-label">Select User:</label>
                            <select
                            name="userName"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            id="userName"
                            className="block w-full input-field"
                            required
                        >
                            <option value="">Select User</option>
                            {/* Filter userProfiles based on staffRole */}
                            {userProfiles
                                .filter(profile => profile.role === staffRole)
                                .map(profile => (
                                    <option key={profile.userid} value={profile.name}>
                                        {profile.name}
                                    </option>
                                ))}
                        </select>
                        </div>
                    )}
                    <div>
                    <label htmlFor="text" className="block input-label">Additional Text:</label>
                    <textarea
                        name="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        id="text"
                        className="block w-full input-field"
                        rows={4}
                        required
                        />
                    </div>
                    <label htmlFor="image" className="block input-label">Insert Image from Camera:</label>
            <input
                type="file"
                accept="image/*"
                capture="camera"
                id="image"
                onChange={handleImageChange} 
                className="block w-full input-field"
            />
        <button type="submit" className="rounded form-btn">Submit Request</button>
        <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
        {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
      </div>
    </form>
    </div>
 )
}
export default AlertStaff;