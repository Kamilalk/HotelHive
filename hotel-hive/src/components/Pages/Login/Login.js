import { useRef, useState} from "react";
import {Form, Button, Card, Alert} from 'react-bootstrap'
import { useAuth } from '../../../contexts/AuthContexts'
import {Link, useHistory} from 'react-router-dom'
import { useStaffProfile } from "../../../contexts/StaffProfileContext"
import { auth, database } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css'


export default function Login() {

    const emailRef = useRef()
    const {login} = useAuth()
    const passwordRef = useRef()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const { profileLogin } = useStaffProfile()

    async function handleSubmit(e) {
        e.preventDefault()

        try{
            setError('')
            setLoading(true)
            const userCredential = await login(emailRef.current.value, passwordRef.current.value);
            await profileLogin(userCredential)
            const currentUser = auth.currentUser;
            
            const userId = currentUser.uid;
            console.log("User ID:", userId);
        
            const role = await fetchUserRole(userId)


            switch (role) {
                case 'Housekeeper':
                  history.push('/');
                  break;
                case 'Manager':
                  history.push('/');
                  break;
                case 'Porter':
                  history.push('/');
                  break;
                case 'Supervisor':
                  history.push('/');
                  break;
                case 'Handyman':
                  history.push('/');
                  break;
                default:
                  
                  break;
              }
        } catch {
            setError('Failed to create find account, check email and password.')
        }

        setLoading(false)
    }

    const fetchUserRole = async (userId) => {
        try {
          const userProfileRef = doc(database, 'UserProfiles', userId);
          const userProfileSnapshot = await getDoc(userProfileRef);
          if (userProfileSnapshot.exists()) {
            const userProfileData = userProfileSnapshot.data();
            const userRole = userProfileData.role;
            console.log("User's role:", userRole);
            return userRole;
          } else {
            console.log("User profile not found.");
            return null; 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          return null; 
        }
      };
      

    return (
        <div className='col-lg-6 col-md-6 col-sm-12 sign-up-form'>
            <form onSubmit={handleSubmit}>
                <p className='signup-title'>Log In</p>
                {error && <Alert variant="danger">{error}</Alert>} 
                <div className='signup-container'>
                    <label htmlFor="email" className="block signup-input-label">Email:</label>
                    <input
                        type="email"
                        ref={emailRef}
                        id="email"
                        className="block w-full signup-input-label"
                        required
                    />
                    <label htmlFor="password" className="block signup-input-label">New Password:</label>
                    <input
                        type="password"
                        ref={passwordRef}
                        id="password"
                        className="block w-full signup-input-label"
                        required
                    />
                    <Button type="submit" className="signup-btn" disabled={loading}>Log In</Button>
                </div>
                <p className="mt-2">Don't have an account? <Link to="/register">Register</Link></p>
            </form>
        </div>
    );
}
