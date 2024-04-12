import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from "../firebase"
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import {auth} from '../firebase'



const StaffProfileContext = createContext();

export const useStaffProfile = () => {
    const context = useContext(StaffProfileContext);
    if (!context) {
        throw new Error('useStaffProfile must be used within a StaffProfileProvider');
    }
    return context;
};

export const StaffProfileProvider = ({ children }) => {
    const [staffProfile, setStaffProfile] = useState(null);
    const [hotelId, setHotelId] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (userCredential) => {
          if (userCredential) {
              try {
                  const userProfile = await getDoc(doc(database, "UserProfiles", userCredential?.user?.uid || userCredential?.uid));
                  const userProfileData = { ...userProfile.data() };
                  setStaffProfile(userProfileData);
                  setHotelId(userProfile.data().hotelId);
              } catch (error) {
                  console.error("Error fetching user profile:", error);
              }
          } else {
              setStaffProfile(null);
              setHotelId(null);
          }
          setLoading(false);
      });
      return () => unsubscribe();
    }, []);



    const profileLogin = async (userCredential) => {
        try {
            const userProfile = await getDoc(doc(database, "UserProfiles", userCredential.user.uid));
            setStaffProfile({ ...userProfile.data()});
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    const profileRegister = async (staffProfile, hotelName) => {
        try {
            //add a new document to the 'hotels' collection
            const hotelDocRef = await addDoc(collection(database, "Hotels"), {
              name: hotelName
            });
            console.log("Hotel added with ID:", hotelDocRef.id);

            //add a user profile to the 'userProfiles' subcollection under this hotel
            const userProfileRef = doc(collection(database, "UserProfiles"), staffProfile.uid);
            await setDoc(userProfileRef, {
              hotelId: hotelDocRef.id, 
              fullName: staffProfile.fullName,
              email: staffProfile.email,
              role: staffProfile.role
            });
            console.log("User profile added for user ID:", staffProfile.uid);
            const userProfile = await getDoc(userProfileRef);
            setStaffProfile({ ...userProfile.data()});
        } catch (error) {
            console.error("Error registering:", error);
        }
    };

    const profileLogout = () => {
      setStaffProfile(null);
      auth.signOut()
    };

    return (
        <StaffProfileContext.Provider value={{ staffProfile, hotelId, profileLogin, profileRegister, profileLogout }}>
            {!loading && children}
        </StaffProfileContext.Provider>
    );
};