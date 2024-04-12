import { database } from "../../../../firebase";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { useStaffProfile } from "../../../../contexts/StaffProfileContext";
import { startOfWeek , format} from "date-fns";


export function useRoomData() {
  const { staffProfile } = useStaffProfile();
  const hotelId = staffProfile.hotelId;
  const today = Date.now();
  const WeekStartDate = startOfWeek(today);
  const formatedDate = format(today, 'yyyy-MM-dd');
  const formatedWeekStartDate = format(WeekStartDate, 'yyyy-MM-dd');

  async function getDataForAllocation() {
    // Reference to the rooms collection in the database
    const roomsCollectionRef = collection(database, `Hotels/${hotelId}/Rooms`);
    const rosterCollectionRef = collection(database, `Hotels/${hotelId}/roster/${formatedWeekStartDate}/${formatedDate}`);


    try {

      const [roomsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(roomsCollectionRef),
        getDocs(rosterCollectionRef)
      ]);

        console.log("Rooms Snapshot:", roomsSnapshot.docs.map(doc => doc.data()));
        console.log("Users Snapshot:", usersSnapshot.docs.map(doc => doc.data()));  
        
        let users = usersSnapshot.docs.map(doc => doc.data())
                                      .map(user => ({ name: user.name, role: user.role}));
        let rooms = roomsSnapshot.docs.map(doc => doc.data())
                                      .map(room => ({
                                        roomNumber: room.roomNumber, 
                                        floor: room.floor,
                                        beds: room.beds,
                                        cleaningStatus: room.cleaningStatus,
                                        occupationStatus: room.occupationStatus,
                                        roomType: room.roomType,
                                        roomState: determineRoomType(room, today)
                                      }));
        return [users, rooms];
      } catch (error) {
        console.error("Error fetching rooms: ", error);
        throw error;
      }
  }





  // Function to fetch all rooms
  async function getAllRooms() {
    // Reference to the rooms collection in the database
    const roomsCollectionRef = collection(database, `Hotels/${hotelId}/Rooms`);
    const usersCollectionRef = collection(database, "UserProfiles");

    try {
        const [roomsSnapshot, usersSnapshot] = await Promise.all([
            getDocs(roomsCollectionRef),
            getDocs(query(usersCollectionRef, where("hotelId", "==", hotelId)))
          ]);

        console.log("Rooms Snapshot:", roomsSnapshot.docs.map(doc => doc.data()));
        console.log("Users Snapshot:", usersSnapshot.docs.map(doc => doc.data()));  

        const roomsByFloor = {};
        const users = [];
        const housekeeperAssignments = {};
    
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.role === "Housekeeper") {
            users.push({
              id: doc.id,
              fullName: user.fullName,
              assignedRooms: [],
              assignedBeds: 0
            });
          }
        });
    
        roomsSnapshot.forEach((doc) => {
          const room = doc.data();
          if (room) {
            room.id = doc.id;
            const roomType = determineRoomType(room, today);
            if (!roomsByFloor[room.floor]) {
              roomsByFloor[room.floor] = {};
            }
            if (!roomsByFloor[room.floor][roomType]) {
              roomsByFloor[room.floor][roomType] = [];
            }
            roomsByFloor[room.floor][roomType].push(room);
          }
        });
    
        const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => {
          const bedsOnFloorA = calculateTotalBeds(roomsByFloor[a]);
          const bedsOnFloorB = calculateTotalBeds(roomsByFloor[b]);
          return bedsOnFloorA - bedsOnFloorB;
        });
    
        let currentHousekeeperIndex = 0;
        sortedFloors.forEach(floor => {
          const housekeeperId = users[currentHousekeeperIndex].id;
          if (!housekeeperAssignments[housekeeperId]) {
            housekeeperAssignments[housekeeperId] = [];
          }
          housekeeperAssignments[housekeeperId][floor] = roomsByFloor[floor];
          currentHousekeeperIndex = (currentHousekeeperIndex + 1) % users.length;
        });
    
        Object.entries(housekeeperAssignments).forEach(([housekeeperId, assignedRoomsByType]) => {
          const housekeeperRooms = [];
          Object.values(assignedRoomsByType).forEach(roomsOfType => {
            if (Array.isArray(roomsOfType)) { // Check if roomsOfType is an array
              housekeeperRooms.push(...roomsOfType);
            }
          });
          const housekeeper = users.find(user => user.id === housekeeperId);
          if (housekeeper) { // Ensure housekeeper exists before assigning rooms
            housekeeper.assignedRooms = housekeeperRooms;
          }
        });
    
        console.log("Housekeeper Assignments:", housekeeperAssignments);
    
        return { housekeeperAssignments, users };
      } catch (error) {
        console.error("Error fetching rooms: ", error);
        throw error;
      }
    }

  return {
    getAllRooms, getDataForAllocation
  };
}

function determineRoomType(room, today) {
  if (room.reservationTo && /\d/.test(room.reservationTo)) {
      const reservationToDateParts = room.reservationTo.split('.');
      const reservationToDate = new Date(
          Number(reservationToDateParts[2]),
          Number(reservationToDateParts[1]) - 1,
          Number(reservationToDateParts[0])
      );
      const reservationFromDateParts = room.reservationFrom.split('.');
      const reservationFromDate = new Date(
          Number(reservationFromDateParts[2]),
          Number(reservationFromDateParts[1]) - 1,
          Number(reservationFromDateParts[0])
      );
      const nights = Math.floor((today - reservationFromDate) / (1000 * 60 * 60 * 24));
      if (reservationToDate <= today) {
          return "departure";
      } else if (nights % 3 === 0) {
          return "linenChange";
      } else {
          return "stayover";
      }
  }
}

function calculateTotalBeds(roomsByType) {
  let totalBeds = 0;
  Object.values(roomsByType).forEach(rooms => {
      totalBeds += rooms.reduce((acc, room) => acc + room.beds, 0);
  });
  return totalBeds;
  }