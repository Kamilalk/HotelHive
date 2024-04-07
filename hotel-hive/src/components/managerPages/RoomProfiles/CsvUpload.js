import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import Papa from 'papaparse'; // Import PapaParse library
import { AddRoom } from '../../../FirestoreOperations'; // Import your AddRoom function
import { useStaffProfile } from '../../../contexts/StaffProfileContext';


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
            // Insert data into Firestore
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
      console.log('All rooms added successfully');
    } catch (error) {
      console.error('Error adding rooms:', error);
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