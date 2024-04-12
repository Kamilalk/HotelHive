
import { database } from "./firebase"
import { collection, addDoc, doc, setDoc, getDoc,  } from "firebase/firestore";


export async function addHotelAndManager(staffProfile, hotelName) {
    try {
        //add a new document to the 'hotels' collection
        const hotelDocRef = await addDoc(collection(database, "Hotels"), {
            name: hotelName
        });
        console.log("Hotel added with ID:", hotelDocRef.id);

        //add a user profile to the 'userProfiles' subcollection under this hotel
        const userProfileRef = doc(collection(database, "Hotels", hotelDocRef.id, "userProfiles"), staffProfile.uid);
        await setDoc(userProfileRef, {
            fullName: staffProfile.fullName,
            email: staffProfile.email,
            role: staffProfile.role
        })
        console.log("User profile added for user ID:", staffProfile.uid);
       
    } catch (error) {
        console.error("Error adding hotel and user:", error);
    }
}

export async function HotelName(hotelId) { 
    try{
        const hotelDocRef = doc(database, "Hotels", hotelId);
        const hotelDoc = await getDoc(hotelDocRef);
        if(hotelDoc.exists()){ 
            return hotelDoc.data().name; 
        }
        else 
        { throw new Error("Hotel not found") }
    }
      catch (error) { 
        console.error("Error getting hotel name:", error); 
    } 
}

export async function AddUserProfile(profile, hId) {
    const userProfileRef = doc(collection(database, "UserProfiles"), profile.uid);
    await setDoc(userProfileRef, {
        hotelId: hId, 
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role
    });
    console.log("User profile added for user ID:", profile.uid);
}

export async function AddRoom(newRoom, hotelId) {
    try {
        const roomCollectionRef = collection(database, `Hotels/${hotelId}/Rooms`);
        const roomDocRef = doc(roomCollectionRef, newRoom.roomNumber);
        
        // Check if the room already exists
        const roomDocSnapshot = await getDoc(roomDocRef);
        if (roomDocSnapshot.exists()) {
            // Room exists, update individual fields
            const existingRoomData = roomDocSnapshot.data();
            await setDoc(roomDocRef, {
                ...existingRoomData, // Maintain existing data
                floor: newRoom.floor,
                beds: newRoom.beds,
                roomType: newRoom.roomType,
                occupationStatus: newRoom.occupationStatus,
                cleaningStatus: newRoom.cleaningStatus,
                additionalNotes: newRoom.additionalNotes,
                reservationFrom: newRoom.reservationFrom,
                reservationTo: newRoom.reservationTo,
                currentRes: newRoom.currentRes 
            });
            console.log("Room updated in hotel with ID:", hotelId);
        } else {
            // Room doesn't exist, add a new document
            await setDoc(roomDocRef, {
                roomNumber: newRoom.roomNumber,
                hotelId: newRoom.hotelId,
                floor: newRoom.floor,
                beds: newRoom.beds,
                roomType: newRoom.roomType,
                occupationStatus: newRoom.occupationStatus,
                cleaningStatus: newRoom.cleaningStatus,
                additionalNotes: newRoom.additionalNotes,
                reservationFrom: newRoom.reservationFrom,
                reservationTo: newRoom.reservationTo,
                currentRes: newRoom.currentRes 
            });
            console.log("Room added to hotel with ID:", hotelId);
        }
    } catch (error) {
        console.error("Error adding/updating room:", error);
    }
}

