import React, { useState, useEffect } from 'react';
import './EditTrainingProfile.css';
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { ref, uploadBytes, deleteObject} from "firebase/storage";
import { storage } from "../../../firebase";

function EditTrainingProfile() {
  const { id } = useParams();
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const database = getFirestore();
  const [newImage, setNewImage] = useState(null);
  const [trainingDetails, setTrainingDetails] = useState({
    trainingName: '',
    imageName: '',
    trainingDescription: '',
    youtubeLink: ''
  });

  useEffect(() => {
    const fetchTrainingProfile = async () => {
      try {
        const trainingDocRef = doc(database, 'Hotels', hotelId, 'Training', id);
        const docSnap = await getDoc(trainingDocRef);
        if (docSnap.exists()) {
          setTrainingDetails(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };
  
    fetchTrainingProfile();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault(); 
    try {
      const trainingDocRef = doc(database, 'Hotels', hotelId, 'Training', id);

      
      await updateDoc(trainingDocRef, trainingDetails);

    
      if (newImage) {
        await updateImage(newImage);
      }

      console.log('Training details updated successfully!');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating Training details:', error.message);
     
    }
  };

  const updateImage = async (imageFile) => {
    try {
        const storageRef = ref(storage, `trainingImages/${imageName}`);
        await deleteObject(storageRef);

        try {
            await uploadBytes(storageRef, imageFile);
            console.log('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
        }

    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const trainingDocRef = doc(database, 'Hotels', hotelId, 'Training', id);

      // Delete staff document 
      await deleteDoc(trainingDocRef);

      console.log('Training Profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting training profile:', error.message);
  
    }
  };

  const {
    trainingName,
    imageName,
    trainingDescription,
    youtubeLink
  } = trainingDetails;

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 staff-form'>
    <form onSubmit={handleEdit}>
        <p className='page-title'>Edit Training Profile</p>
        <div className='input-container'>
            <label htmlFor="trainingName" className="block input-label">Training Name:</label>
            <input
            type="text"
            name="trainingName"
            value={trainingName}
            onChange={e => setTrainingDetails({ ...trainingDetails, trainingName: e.target.value })}
            id="trainingName"
            className="block w-full input-field"
            required
            />
            <label htmlFor="trainingDescription" className="block input-label">Training Description:</label>
            <textarea
            name="trainingDescription"
            value={trainingDescription}
            onChange={e => setTrainingDetails({ ...trainingDetails, trainingDescription: e.target.value })}
            id="trainingDescription"
            className="block w-full input-field"
            required
            />
            <label htmlFor="youtubeLink" className="block input-label">YouTube Link:</label>
            <input
            type="text"
            name="youtubeLink"
            value={youtubeLink}
            onChange={e => setTrainingDetails({ ...trainingDetails, youtubeLink: e.target.value })}
            id="youtubeLink"
            className="block w-full input-field"
            required
            />
            <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />
            <button type="submit" className="form-btn">Edit Training</button>
            <button onClick={handleDelete} className="form-btn">Delete Training</button>
        </div>
    </form>
        {showSuccessPopup && (
          <div className="success-popup">
            <p>Training  details updated successfully!</p>

          </div>
        )}
    </div>
  );
}

export default EditTrainingProfile;