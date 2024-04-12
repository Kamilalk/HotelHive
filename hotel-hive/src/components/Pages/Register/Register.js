import { useRef, useState} from "react";
import {Form, Button, Card, Alert} from 'react-bootstrap'
import { useAuth } from '../../../contexts/AuthContexts'
import { Link, useHistory } from 'react-router-dom'
import { StaffProfile } from "../../../objects/StaffProfile"
import { useStaffProfile } from "../../../contexts/StaffProfileContext"
import './Register.css'

export default function Register() {

    const fullNameRef = useRef()
    const emailRef = useRef()
    const hotelNameRef = useRef()
    const passwordRef = useRef()
    const confirmPasswordRef = useRef()
    const {register} = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const {profileRegister} = useStaffProfile()

    async function handleSubmit(e) {
        e.preventDefault()

        if (passwordRef.current.value !== confirmPasswordRef.current.value){
            return setError('passwords do not match')
        }

        try{
            setError('');
            setLoading(true);
            const uid = await register(emailRef.current.value, passwordRef.current.value);

            const staffProfile = new StaffProfile(uid, fullNameRef.current.value, emailRef.current.value, "Manager");

            const hotelName = hotelNameRef.current.value


            await profileRegister(staffProfile, hotelName)

            history.push('/')

            //reset fields
            fullNameRef.current.value = ''
            emailRef.current.value = ''
            hotelNameRef.current.value = ''
            passwordRef.current.value = ''
            confirmPasswordRef.current.value = ''
        } catch {
            setError('Failed to create an account')
        }

        setLoading(false)
    }

    return (
        <div className='col-lg-6 col-md-6 col-sm-12 register-form'>
            <form onSubmit={handleSubmit}>
                <p className='register-title'>Register</p>
                {error && <Alert variant="danger">{error}</Alert>} 
                <div className='register-container'>
                    <label htmlFor="fullName" className="block register-input-label">Full Name:</label>
                    <input
                        type="text"
                        ref={fullNameRef}
                        id="fullName"
                        className="block w-full register-input-label"
                        required
                    />
                    <label htmlFor="email" className="block register-input-label">Email:</label>
                    <input
                        type="email"
                        ref={emailRef}
                        id="email"
                        className="block w-full register-input-label"
                        required
                    />
                    <label htmlFor="hotelName" className="block register-input-label">Hotel Name:</label>
                    <input
                        type="text"
                        ref={hotelNameRef}
                        id="hotelName"
                        className="block w-full register-input-label"
                        required
                    />
                    <label htmlFor="password" className="block register-input-label">New Password:</label>
                    <input
                        type="password"
                        ref={passwordRef}
                        id="password"
                        className="block w-full register-input-label"
                        required
                    />
                    <label htmlFor="confirmPassword" className="block register-input-label">New Password:</label>
                    <input
                        type="password"
                        ref={confirmPasswordRef}
                        id="confirmPassword"
                        className="block w-full register-input-label"
                        required
                    />
                    <Button type="submit" className="register-btn" disabled={loading}>register</Button>
                </div>
                <p className="mt-2">Don't have an account? <Link to="/login">Log In</Link></p>
            </form>
        </div>
    )
}

