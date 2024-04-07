
import './TrainingProfile.css'
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { database, storage } from '../../../firebase';
import { useStaffProfile } from "../../../contexts/StaffProfileContext"; 
import { ref, getDownloadURL } from "firebase/storage";



function TrainingProfile() {
    const { id } = useParams();
    const [trainingProfile, setTrainingProfile] = useState(null);
    const { staffProfile } = useStaffProfile();
    const hotelId = staffProfile.hotelId;
    const [imageUrl, setImageUrl] = useState(null);
  
    useEffect(() => {
        const fetchTrainingProfile = async () => {
          try {
            const docRef = doc(database, 'Hotels', hotelId, 'Training', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setTrainingProfile(docSnap.data());
            } else {
              console.log('No such document!');
            }
          } catch (error) {
            console.error('Error fetching document: ', error);
          }
        };
      
        fetchTrainingProfile();
      }, [id]);
  
    useEffect(() => {
        // Function to fetch the image URL from Firebase Storage
        const fetchImageUrl = async () => {
          try {
            // Replace 'path/to/image' with the actual path to your image in Firebase Storage
            const storageRef = ref(storage, `trainingImages/${trainingProfile.imageName}`);
            const url = await getDownloadURL(storageRef);
            console.log('Image URL:', url);
            setImageUrl(url);
          } catch (error) {
            console.error('Error fetching image URL:', error);
          }
        };
    
        // Call the fetchImageUrl function when the component mounts
        if (trainingProfile) {
          fetchImageUrl();
        }
      }, [trainingProfile]);
  
    if (!trainingProfile) {
      return <div>Loading...</div>;
    }

    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : '';
      }
  
    return (
      <div className='col-lg-6 col-md-6 col-sm-12 training-profile-form'>
        <div className="title-container">
          <p className="training-profile-title">{trainingProfile.trainingName}</p>
        </div>
        <div className='training-profile-details'>
            {imageUrl ? (
                <div className="image-container">
                    <img src={imageUrl} alt="training-profile-image" className="training-profile-image" />
                </div>
            ) : (
                <p>Loading image...</p>
            )}
        </div>
        <label htmlFor="trainingDescription" className="block input-label"> Description: </label>
        <div className="training-profile-details">
          <p>{trainingProfile.trainingDescription}</p>
        </div>
        <label htmlFor="youtubeLink" className="block input-label">YouTube Video: </label>
        <div className="training-profile-details">
            <div className="video-container">
                <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(trainingProfile.youtubeLink)}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ></iframe>
            </div>
        </div>
        <div className="text-center mt-4">
          <button className="form-btn">
            <Link to={`/edittrainingprofile/${id}`}>Edit</Link>
          </button>
        </div>
      </div>
    );
  }
  
  export default TrainingProfile;