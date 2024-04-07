import "./RoomAssignmentComponent.css";
import RoomViewCard from "../Cards/RoomViewCard";
import React from 'react'

const RoomAssignmentComponent = () => {
  return (
    <div className="py-3 room-assignments-component">
      <div className="d-flex align-items-center">
        <img className="user-image rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
        <p className="text-black mx-2 mb-0">Kamila K</p>
      </div>
      <div className="row">
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 501"} type={"Stay Over"} status={"In Progress"} bedType1={"1 Double"} bedType2={"1 Double"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 502"} type={"Empty"} status={"In Progress"} bedType1={"3 Singles"} bedType2={"1 Double"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 503"} type={"Occupied"} status={"In Complete"} bedType1={"1 Double"} bedType2={"1 Singles"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 504"} type={"Stay Over"} status={"In Progress"} bedType1={"1 Double"} bedType2={"1 Double"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 505"} type={"Empty"} status={"In Progress"} bedType1={"3 Singles"} bedType2={"1 Double"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 506"} type={"Occupied"} status={"In Complete"} bedType1={"1 Double"} bedType2={"1 Singles"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 507"} type={"Stay Over"} status={"In Progress"} bedType1={"1 Double"} bedType2={"1 Double"} />
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <RoomViewCard roomTitle={"Room 508"} type={"Empty"} status={"In Progress"} bedType1={"3 Singles"} bedType2={"1 Double"} />
        </div>
      </div>
    </div>

  )
}

export default RoomAssignmentComponent