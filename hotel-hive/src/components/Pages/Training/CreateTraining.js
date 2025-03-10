import "./CreateTraining.css";
import React, { useState} from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext"; 
import { database, storage  } from "../../../firebase";
import { collection,  addDoc,} from "firebase/firestore";
import { ref, uploadBytes} from "firebase/storage";
import { useHistory } from "react-router-dom";

const CreateTraining = () => {
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [trainingName, setTrainingName] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [trainingDescription, setTrainingDescription] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [image, setImage] = useState(null); 
  const [imageName, setImageName] = useState('');
  const history = useHistory();

  const handleImageUpload = async (image, imageName) => {
    if (image) { 
      const storageRef = ref(storage, `trainingImages/${imageName}`);
      try {
        await uploadBytes(storageRef, image);
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
      const trainingCollectionRef = collection(database, 'Hotels', hotelId, 'Training');
      await addDoc(trainingCollectionRef, {
        trainingName: trainingName,
        trainingDescription: trainingDescription,
        youtubeLink: youtubeLink,
        imageName: imageName,
      });

      // Handle image upload
      handleImageUpload(image, imageName);

      console.log('Training created successfully:', trainingName);
      setShowSuccessPopup(true);
      // Reset form state after successful creation
      setTrainingName('');
      setTrainingDescription('');
      setYoutubeLink('');
      setImage(null);
      setImageName('');

  };


return (
  <div className='col-lg-6 col-md-6 col-sm-12 training-create-form'>
    <form onSubmit={handleSubmit}>
      <p className='d-flex align-items-center justify-content-between training-edit-title'>Create a Training Profile</p>
      <div className='chat-container'>
        <label htmlFor="trainingName" className="block input-label">Training Profile Name:</label>
        <input
          type="text"
          name="trainingName"
          value={trainingName}
          onChange={e => setTrainingName(e.target.value)}
          id="trainingName"
          className="rounded block w-full input-field"
          required
        />
        <label htmlFor="trainingDescription" className="block input-label">Training Profile Description:</label>
        <textarea
            name="trainingDescription"
            value={trainingDescription}
            onChange={e => setTrainingDescription(e.target.value)}
            id="trainingDescription"
            className="rounded block w-full input-field"
            required
        />
        <label htmlFor="youtubeLink" className="block input-label">YouTube Link:</label>
          <input
              type="text"
              name="youtubeLink"
              value={youtubeLink}
              onChange={e => setYoutubeLink(e.target.value)}
              id="youtubeLink"
              className="rounded block w-full input-field"
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])} // Store the selected image in state
          />
          <input
            type="text"
            placeholder="Image Name"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />


      </div>
      <button type="submit" className="rounded form-btn">Create Training</button>
      <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
    </form>
    {showSuccessPopup && (
        <div className="success-popup">
          <p>New Training Profile Created Successfully!</p>
        </div>
      )}
  </div>
);
};

export default CreateTraining;