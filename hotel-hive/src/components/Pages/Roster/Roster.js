import React, { useState, useEffect } from "react";
import { useStaffProfile } from "../../../contexts/StaffProfileContext";
import { collection, query, where, onSnapshot, addDoc, Timestamp, doc, getDoc, getDocs } from "firebase/firestore";
import { database } from '../../../firebase'; // Assuming db is your Firestore instance
import './Roster.css';
import { format, startOfWeek, addDays } from "date-fns";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RosterComponent from "./RosterComponent/RosterComponent";
import { useHistory } from 'react-router-dom';


const Roster = () => {
  const { staffProfile } = useStaffProfile();
  const hotelid = staffProfile.hotelId;
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState({});
  const dayNames = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const role = staffProfile.role;
  const history = useHistory();

  useEffect(() => {

    const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const sundayWeekStartDate = startOfWeek(selectedDate); //start the week from Monday instead of Sunday
  
   
    let unsubscribe = []; 
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStartDate, i);
      const currentFormattedDate = format(currentDate, 'yyyy-MM-dd');
      const currentShiftsRef = collection(database, `Hotels/${hotelid}/roster/${format(sundayWeekStartDate, 'yyyy-MM-dd')}/${currentFormattedDate}`);
  
      unsubscribe.push(onSnapshot(currentShiftsRef, (querySnapshot) => {
        const shiftsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        console.log(`Shifts for ${currentFormattedDate}:`, shiftsData); 
      
        setShifts(prevShifts => ({
          ...prevShifts,
          [currentFormattedDate]: shiftsData
        }));
      }));
    }
  
    return () => {
      
      unsubscribe.forEach(fn => fn());
    };
  }, [selectedDate, hotelid]);
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  const weekDates = [];
  const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start the week from Monday
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStartDate, i);
    weekDates.push(format(currentDate, 'yyyy-MM-dd'));
  }



  const [newShift, setNewShift] = useState({
    name: "", 
    date: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    const q = query(collection(database, 'UserProfiles'), where("hotelId", "==", hotelid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUsers(querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName,
        role: doc.data().role 
      })));
    });
    return unsubscribe;
  }, [hotelid]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewShift(prevShift => ({
      ...prevShift,
      [name]: value
    }));
  };




  const handleAddShift = async () => {
    if (!newShift.name || !newShift.date || !newShift.startTime || !newShift.endTime) {
      alert("Please fill out all fields");
      return;
    }

    //fetch user's details
    const selectedUserRef = doc(database, 'UserProfiles', newShift.name);
    const userSnapshot = await getDoc(selectedUserRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const formattedDate = newShift.date;
      const weekStartDate = startOfWeek(new Date(newShift.date));
 
      const hotelRosterRef = collection(database, `Hotels/${hotelid}/roster/${format(weekStartDate, 'yyyy-MM-dd')}/${formattedDate}`);
      
      if (shifts[formattedDate]) {
        const existingShift = shifts[formattedDate].find(shift => shift.userid === newShift.name);
        if (existingShift) {
          alert("This user is already scheduled for the selected date");
          return;
        }
      }
      
      //add the shift data to the week's roster collection directly
      await addDoc(hotelRosterRef, {
        userid: newShift.name,
        name: userData.fullName,
        date: formattedDate,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        role: userData.role,
      });
    
      //update the shifts state
      const updatedShifts = { ...shifts };
      if (!updatedShifts[formattedDate]) {
        updatedShifts[formattedDate] = [];
      }
      updatedShifts[formattedDate].push({
        userid: newShift.name,
        name: userData.fullName,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        role: userData.role,

      });
      setShifts(updatedShifts);
    
      //clear input fields and show success message
      setNewShift({ name: "", date: "", startTime: "", endTime: "" });
      alert("Shift added successfully!");
    };

    //clear input fields after adding a shift
    setNewShift({
      name: "",
      date: "",
      startTime: "",
      endTime: ""
    });

    alert("Shift added successfully!");
  };

  return (
    <div>
    <div className="container d-flex justify-content-center align-items-center ">
    {role === 'Manager' && (
        <div className="col-lg-3 col-md-6 col-sm-12 roster-form">
          <p className="d-flex align-items-center justify-content-center mt-3 roster-title">Add to Roster</p>
          <div className="roster-form-container">
            <label htmlFor="name" className='block input-label'>Employee</label>
            <select
              name="name"
              value={newShift.name}
              onChange={handleInputChange}
              className="rounded block w-full input-field"
            >
              <option value="">Select User</option>
              {users.map((user, index) => (
                <option key={index} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
            <label htmlFor="date" className='block input-label'>Day</label>
            <input
              name="date"
              type="date"
              value={newShift.date}
              onChange={handleInputChange}
              className="rounded block w-full input-field"
            />
            <label htmlFor="startTime" className='block input-label'>Start Time</label>
            <input
              name="startTime"
              type="time"
              value={newShift.startTime}
              onChange={handleInputChange}
              className="rounded block w-full input-field"
            />
            <label htmlFor="endTime" className='block input-label'>End Time</label>
            <input
              name="endTime"
              type="time"
              value={newShift.endTime}
              onChange={handleInputChange}
              className="rounded block w-full input-field"
            />
            <button className="rounded submit-button" onClick={handleAddShift}>Add</button>
          </div>
        </div> 
       
      )}
      </div>


      <div className=" calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
        />
      </div>


      <div id="week-schedule">
        {weekDates.map((date, index) => (
          <div key={index} className="schedule-day">
            <div>
              <h1 className="week-day">{dayNames[index]}</h1>
              <p className="week-date">{date}</p>
            </div>
            <div>
              {shifts[date] && shifts[date].length > 0 ? (
                shifts[date].map((shift, idx) => (
                  <RosterComponent 
                    key={`${date}-${idx}`}
                    docid={shift.id} 
                    date={date}
                    id={shift.userid}
                    role={shift.role}
                    name={shift.name}
                    startTime={shift.startTime}
                    finishTime={shift.endTime}
                  />
                ))
              ) : (
                <p>No shifts scheduled</p>
              )}
            </div>
          </div>
        ))}
        <button onClick={() => history.goBack()} className="rounded form-btn">Back</button>
      </div>

    </div>
  );
  
};

export default Roster;



