import { database } from "./firebase";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { useStaffProfile } from "./contexts/StaffProfileContext";
// Define a class for RoomAllocationAlgorithm


export async function RoomAllocationAlgorithm() {
    const { staffProfile } = useStaffProfile();
    const staffId = staffProfile.uid;
    const hotelId = staffProfile.hotelId;
    const today = new Date("2024-03-06");
    const xDays = 3;

    const dueOuts = [];
    const stayovers = [];
    const stayoversWithLinenChange = [];

    const users = [];

    const roomsCollectionRef = collection(database, `Hotels/${hotelId}/Rooms`);
    const usersCollectionRef = collection(database, "UserProfiles");

    try {
        const [roomsSnapshot, usersSnapshot] = await Promise.all([
            getDocs(roomsCollectionRef),
            getDocs(query(usersCollectionRef, where("hotelId", "==", hotelId)))
          ]);

        console.log("Rooms Snapshot:", roomsSnapshot.docs.map(doc => doc.data()));
        console.log("Users Snapshot:", usersSnapshot.docs.map(doc => doc.data()));  

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
            if (room && room.cleaningStatus !== "clean") {
              room.id = doc.id;
              if (room.reservationTo === today) {
                dueOuts.push(room);
              } else if (room.reservationFrom + xDays * 24 * 60 * 60 * 1000 === today) {
                stayoversWithLinenChange.push(room);
              } else {
                stayovers.push(room);
              }
            }
          });
        
        const housekeeperAssignments = divideRoomsAmongStaff(users, dueOuts, stayovers, stayoversWithLinenChange);
        return housekeeperAssignments;
    }
    catch (error) {
        console.error("Error fetching rooms: ", error);
        throw error;
      }

}

async function divideRoomsAmongStaff(users, dueOuts, stayovers, stayoversWithLinenChange) {
    // Combine due outs and stayovers with linen change into a single array
    const roomsWithBeds = [...dueOuts, ...stayoversWithLinenChange];
  
    // Shuffle the roomsWithBeds array
    const shuffledRoomsWithBeds = stableShuffle(roomsWithBeds);
  
    // Sort rooms by floor and number of beds
    shuffledRoomsWithBeds.sort((a, b) => {
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      } else {
        // If rooms are on the same floor, sort by number of beds (descending)
        return b.beds - a.beds;
      }
    });
  
    // Initialize housekeeper assignments
    const housekeeperAssignments = users.map(user => ({ user, rooms: [], floors: new Set(), beds: 0 }));

    // Assign rooms to housekeepers
    let housekeeperIndex = 0;

    for (let room of shuffledRoomsWithBeds) {
      // Find the next housekeeper that can take the room
      while (housekeeperAssignments[housekeeperIndex].floors.size >= 2 && 
             !housekeeperAssignments[housekeeperIndex].floors.has(room.floor)) {
        housekeeperIndex = (housekeeperIndex + 1) % housekeeperAssignments.length;
      }

      // Assign the room to the housekeeper
      housekeeperAssignments[housekeeperIndex].rooms.push(room);
      housekeeperAssignments[housekeeperIndex].floors.add(room.floor);
      housekeeperAssignments[housekeeperIndex].beds += room.beds;

      // Move to the next housekeeper for the next room
      housekeeperIndex = (housekeeperIndex + 1) % housekeeperAssignments.length;
    }

    // Sort stayovers by floor
    stayovers.sort((a, b) => a.floor - b.floor);
  
    // Assign stayovers to housekeepers with fewer beds
    let j = 0;
    while (stayovers.length > 0) {
      // Find the housekeeper with the fewest beds
      const housekeeper = housekeeperAssignments.sort((a, b) => a.beds - b.beds)[0];
  
      // Assign a stayover to the housekeeper
      const room = stayovers[j % stayovers.length];
      housekeeper.rooms.push(room);
      housekeeper.floors.add(room.floor);
      stayovers.splice(j % stayovers.length, 1);
      j++;
    }
  
    return housekeeperAssignments;
}

function stableShuffle(array) {
    // Add an 'originalIndex' property to each element
    const arrayWithIndices = array.map((element, index) => ({ element, originalIndex: index }));
  
    // Shuffle the array
    for (let i = arrayWithIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayWithIndices[i], arrayWithIndices[j]] = [arrayWithIndices[j], arrayWithIndices[i]];
    }
  
    // Sort the array by 'originalIndex' to break ties
    arrayWithIndices.sort((a, b) => a.originalIndex - b.originalIndex);
  
    // Remove the 'originalIndex' property and return the shuffled array
    return arrayWithIndices.map(({ element }) => element);
  }