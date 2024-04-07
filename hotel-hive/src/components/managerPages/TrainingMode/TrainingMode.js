import TrainingComponent from "./TrainingComponents/TrainingComponent";
import "./TrainingMode.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext"
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { database } from "../../../firebase";
import { useHistory } from "react-router-dom";

const TrainingMode = () => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [trainings, setTrainings] = useState([]);
  const history = useHistory();


  const handleCreateChatClick = () => {
    history.push("/Training/CreateTraining");
  };


  useEffect(() => {
    const fetchChats = async () => {
      const q = query(collection(database, "Hotels", hotelid, "Training"));
      onSnapshot(q, (querySnapshot) => {
        setTrainings(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    };
    fetchChats();
  }, []);


  return (
    <section className="p-5 Training-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 chat-title">Training Profiles</p>
        <div className="d-flex">
        <button
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
            onClick={handleCreateChatClick}
          >
            Create New Training Profile
          </button>
        </div>
      </div>

      <div className="row">
        {trainings.map((training, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <TrainingComponent
              id={training.id}
              name={training.trainingName}

            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default TrainingMode;