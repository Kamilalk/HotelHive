import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import Papa from 'papaparse'; 
import { AddRoom } from '../../../FirestoreOperations'; 
import { useStaffProfile } from '../../../contexts/StaffProfileContext';
import { collection, query, where, getDocs, updateDoc, runTransaction } from 'firebase/firestore';
import { database } from '../../../firebase';


const CSVUpload = () => {
  const [file, setFile] = useState();
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState('');
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const [successMessage, setSuccessMessage] = useState('');


  const fileReader = new FileReader();
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        Papa.parse(csvOutput, {
          header: true,
          complete: function (results) {
            setCsvData(results.data);
            insertDataIntoFirestore(results.data);
          },
          error: function (error) {
            console.error('Error parsing CSV:', error);
            setError('Error parsing CSV');
          }
        });
      };

      fileReader.readAsText(file);
    }
  };

  const insertDataIntoFirestore = async (data) => {
    try {
      const promises = data.map(async (row) => {
        const newRoom = {
          roomNumber: row.roomNumber,
          hotelId: hotelId,
          floor: row.floor,
          beds: row.beds,
          roomType: row.roomType,
          occupationStatus: row.occupationStatus,
          cleaningStatus: row.cleaningStatus,
          reservationFrom: row.reservationFrom || "",
          reservationTo: row.reservationTo || "",
          currentRes: row.reservationNo || "",
          additionalNotes: row.additionalNotes || ""
        };
        await AddRoom(newRoom, hotelId);
      });
      await Promise.all(promises);
      setSuccessMessage(`${data.length} rooms uploaded successfully`);
      ChangeDataInRoomAssignments(data);
      console.log('All rooms added successfully');
    } catch (error) {
      console.error('Error adding rooms:', error);
    }
  };

  const ChangeDataInRoomAssignments = async (data) => {
    try {
      const promises = data.map(async (row) => {
        const roomAllocationCollectionRef = collection(database, 'Hotels', hotelId, 'RoomAllocation');
        const roomAllocationQuerySnapshot = await getDocs(roomAllocationCollectionRef);
        
        const promises = roomAllocationQuerySnapshot.docs.map(async (docSnapshot) => {
          const roomAllocationData = docSnapshot.data();
          const assignedRooms = roomAllocationData.assignedRooms || [];
          
          const roomIndex = assignedRooms.findIndex(room => room.roomNumber === row.roomNumber);
          if (roomIndex !== -1) {
            // Room exists, update the existing document
            assignedRooms[roomIndex] = {
              ...assignedRooms[roomIndex],
              cleaningStatus: row.cleaningStatus || "",
              floor: row.floor || "",
              roomType: row.roomType || "",
              occupationStatus: row.occupationStatus || "",
         
            };
            await updateDoc(docSnapshot.ref, { assignedRooms });
            console.log(`Room ${row.roomNumber} updated successfully`);
          } else {
            console.log(`Room ${row.roomNumber} not found in RoomAllocation collection. Skipping...`);
          }
        });
  
        await Promise.all(promises);
      });
  
      await Promise.all(promises);
  
      setSuccessMessage(`Rooms updated successfully`);
      console.log('All rooms updated successfully');
    } catch (error) {
      console.error('Error updating rooms:', error);
    }
  };

  return (
    <div className="container" style={{ marginTop: '50vh', transform: 'translateY(-50%)' }}>
      <div className='row justify-content-center'>
        <div className='col-lg-4 col-md-4 col-sm-6'>
          <Card>
            <Card.Body>
              <form>
                <input
                  type={"file"}
                  id={"csvFileInput"}
                  accept={".csv"}
                  onChange={handleOnChange}
                />

                <button
                  onClick={(e) => {
                    handleOnSubmit(e);
                  }}
                >
                  IMPORT CSV
                </button>
              </form>

              {error && <div>Error: {error}</div>}
              {successMessage && <div>{successMessage}</div>}

            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default CSVUpload;