import "./UpdateRoomAssignments.css";
import React from "react";
import RoomAssignmentComponent from "../../RoomAssignmentComponent/RoomAssignmentComponent";
import { Link } from "react-router-dom";

const UpdateRoomAssignments = () => {
  return (
    <section className="p-5 update-room-assignments">
      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 page-title">Manage Room Assignments</p>
        <Link to="/managerPages/RoomAssignments/Update"
          className="rounded text-black d-flex align-items-center justify-content-between page-button"
        >
          <span className="mr-2">Save and Update </span> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_9_972" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="12" height="12">
              <path d="M3.47233 8.66668H10.919L7.66566 11.92C7.40566 12.18 7.40566 12.6067 7.66566 12.8667C7.92566 13.1267 8.34566 13.1267 8.60566 12.8667L12.999 8.47334C13.259 8.21335 13.259 7.79334 12.999 7.53335L8.61233 3.13334C8.48778 3.00851 8.31868 2.93835 8.14233 2.93835C7.96599 2.93835 7.79689 3.00851 7.67233 3.13334C7.41233 3.39334 7.41233 3.81334 7.67233 4.07334L10.919 7.33334H3.47233C3.10566 7.33334 2.80566 7.63335 2.80566 8.00001C2.80566 8.36668 3.10566 8.66668 3.47233 8.66668Z" fill="black" />
            </mask>
            <g mask="url(#mask0_9_972)">
              <rect width="16" height="16" fill="#09101D" />
            </g>
          </svg>
        </Link>
      </div>
      <div className="py-3 row">
        <div className="col-lg-4 col-md-4 col-sm-12">
          <div className="border radio-container">
            <label class="container">
              <div className="d-flex align-items-center">
                <input type="radio" name="radio" />
                <span class="checkmark"></span>
                <span className="radio-title">Remove Room From List</span>
              </div>
            </label>
            <label class="container">
              <div className="d-flex align-items-center">
                <input type="radio" name="radio" />
                <span class="checkmark"></span>
                <span className="radio-title">Switch Rooms</span>
              </div>
            </label>
            <label class="container">
              <div className="d-flex align-items-center">
                <input type="radio" name="radio" />
                <span class="checkmark"></span>
                <span className="radio-title">Switch Lists</span>
              </div>
            </label>
            <label class="container">
              <div className="d-flex align-items-center">
                <input type="radio" name="radio" />
                <span class="checkmark"></span>
                <span className="radio-title">Transfer Room From User To User</span>
              </div>
            </label>

          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 col-one-container">
              <label for="housekeepername" class="block text-sm font-medium leading-6 text-gray-900">Housekeeper Name</label>
              <input
                type="text"
                name="housekeepername"
                id="housekeepername"
                class="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6"
                placeholder="Enter Name..."
              />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 col-two-container">
              <label for="roomno" class="block text-sm font-medium leading-6 text-gray-900">Room No</label>
              <input
                type="text"
                name="roomno"
                id="roomno"
                class="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6"
                placeholder="Room No..."
              />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 col-three-container">
              <label for="prihousekeepernamece" class="block text-sm font-medium leading-6 text-gray-900">Housekeeper Name</label>
              <input
                type="text"
                name="housekeepername"
                id="housekeepername"
                class="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6"
                placeholder="Enter Name..."
              />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 col-four-container">
              <label for="roomno" class="block text-sm font-medium leading-6 text-gray-900">Room No</label>
              <input
                type="text"
                name="roomno"
                id="roomno"
                class="block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6"
                placeholder="Room No..."
              />
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-2 col-sm-12 change-rooms">
          <button>Change Rooms</button>
        </div>
      </div>

      <RoomAssignmentComponent />
      <RoomAssignmentComponent />
      <RoomAssignmentComponent />
      <RoomAssignmentComponent />
    </section>
  )
}

export default UpdateRoomAssignments