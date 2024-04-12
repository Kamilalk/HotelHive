import "./Nav.css";
import { useStaffProfile } from '../../contexts/StaffProfileContext'
import { HotelName } from '../../FirestoreOperations'
import { useEffect, useState } from 'react'
import { auth } from '../../firebase';

import { Link, useHistory } from "react-router-dom";

function Nav() {
  const [toggleProfile, setToggleProfile] = useState(false);
  const { staffProfile } = useStaffProfile()
  const [hotelName, setHotelName] = useState('')
  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  const userRole = staffProfile?.role;
  const history = useHistory();

   useEffect(() => {
     if (staffProfile && staffProfile.hotelId) {
       HotelName(staffProfile.hotelId).then(name => {
         setHotelName(name)
       })
     }
  }, [staffProfile])

  const handleSignOut = () => {
    auth.signOut()
        .then(() => {
            // Sign-out successful.
            console.log('User signed out successfully');
            // Optionally, redirect the user to another page or perform any other action after sign-out.
        })
        .catch((error) => {
            // An error occurred during sign-out.
            console.error('Error signing out:', error);
            // Optionally, display an error message to the user.
        });
};

const handleImageClick = () => {
  // Your logic here when the image is clicked
  console.log('Image clicked!');
  
  // Example: Redirect based on userRole
  switch (userRole) {
    case 'Manager':
      history.push('/');
      break;
    case 'Supervisor':
      history.push('/');
      break;
    case 'Housekeeper':
      history.push('/');
      break;
    case 'Porter':
        history.push('/');
        break;
    case 'Handyman':
      history.push('/');
      break;
    default:
      // Handle default case
      break;
  }
}

useEffect(() => {
  let timer;
  if (toggleProfile) {
    // Set a timer to hide the profile dropdown after 10 seconds
    timer = setTimeout(() => {
      setToggleProfile(false);
    }, 4000);
  }
  // Clear the timer if the toggle state changes before the timer ends
  return () => clearTimeout(timer);
}, [toggleProfile]);


  return (
    <>
      <nav
        style={{ backgroundColor: "#D969DC", height: "70px", zIndex: 1 }}
        className="d-flex align-items-center justify-content-between nav-bar position-sticky top-0"
      >
        <>
          <div className="d-flex align-items-center">
            <div onClick={handleImageClick}>  
              <svg className="logo" width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width="100" height="70" fill="url(#pattern0)" />
                <defs>
                  <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_6_33115" transform="matrix(0.00277778 0 0 0.00396825 0 -0.176587)" />
                  </pattern>
                  <image id="image0_6_33115" width="360" height="341" xlinkHref="data:image/png;base64,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" />
                </defs>
              </svg>
              </div>
            {userId && staffProfile && staffProfile.fullName && (
              <p className="m-0 title">{hotelName}</p>
            )}
          </div>
        </>
        <div className="">
          {/* <!-- Profile dropdown --> */}
          <div className="relative ml-3">
            <div onClick={() => setToggleProfile(!toggleProfile)} className="d-flex">

            {userId && staffProfile && staffProfile.fullName && (
                <p style={{ color: "#FFFCFC" }} className="rounded-md px-3 mt-1 text-sm font-medium"> {staffProfile.fullName}</p>
              )}

            </div>
            {
              userId && toggleProfile && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
                  {/* <!-- Active: "bg-gray-100", Not Active: "" --> */}
                  <button className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-0"><Link to={`/myprofile/${userId}`}>Profile</Link></button>

                  <button
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-1"
                    onClick={handleSignOut} // Call handleSignOut function when the button is clicked
                >
                    Sign out
                </button>

                </div>
              )
            }
          </div>
        </div>

        {/* <!-- Mobile menu, show/hide based on menu state. --> */}
        <>
          {/* <div className="d-none sm:hidden" id="mobile-menu" >
            <div className="space-y-1 px-2 pb-3 pt-2">
              <button className="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium" aria-current="page">Dashboard</button>
              <button className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Team</button>
              <button className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Projects</button>
              <button className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Calendar</button>
            </div>
          </div > */}
        </>
      </nav >
    </>
  )
}

export default Nav;