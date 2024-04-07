import RoomListsComponent from "./RoomListsComponent/RoomListsComponent";
import "./RoomLists.css";
import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../../contexts/StaffProfileContext";
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { database } from "../../../../firebase";
import { useHistory } from "react-router-dom";



const RoomLists = () => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [roomLists, setRoomLists] = useState([]);
  const history = useHistory();


  const handleCreateRoomList = () => {
    history.push("/roomlists/createroomlist");
  };


  useEffect(() => {
    const fetchChats = async () => {
      const q = query(collection(database, "Hotels", hotelid, "RoomLists"));
      onSnapshot(q, (querySnapshot) => {
        setRoomLists(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    };
    fetchChats();
  }, []);


  return (
    <section className="p-5 roomlists-profiles">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 roomlists-title">Room Lists</p>
        <div className="d-flex">
        <button
            className="rounded text-black d-flex align-items-center justify-content-between page-button"
            onClick={handleCreateRoomList}
          >
            Create New Room List
          </button>
        </div>
      </div>

      <div className="row">
        {roomLists.map((roomlist, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <RoomListsComponent
              id={roomlist.id}
              name={roomlist.listName}

            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default RoomLists