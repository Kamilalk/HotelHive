import { useRef, useState} from "react";
import {Form, Button, Card, Alert} from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContexts'
import {Link, useHistory} from 'react-router-dom'
import { useStaffProfile } from "../../contexts/StaffProfileContext"
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
            history.push('/')
        } catch {
            setError('Failed to create an account')
        }

        setLoading(false)
    }

    return (
        <div className='col-lg-6 col-md-6 col-sm-12 sign-up-form'>
            <form onSubmit={handleSubmit}>
                <p className='signup-title'>Log In</p>
                {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
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
