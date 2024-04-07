import { useState } from "react";
import { StaffProfile } from "../../../objects/StaffProfile"
import { auth } from '../../../firebase'
import { AddUserProfile } from "../../../FirestoreOperations";
import { useStaffProfile } from '../../../contexts/StaffProfileContext'
import './AddStaff.css'

const AddStaff = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { staffProfile } = useStaffProfile();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);

      const { user } = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      const uid = user.uid;

      const profile = new StaffProfile(
        uid,
        fullName,
        email,
        staffRole
      );

      // Get hotelId from staffProfile
      const hotelId = staffProfile.hotelId;

      await AddUserProfile(profile, hotelId);

      // Reset fields
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setStaffRole("");

      await auth.signOut();
    } catch {
      setError('Failed to create an account');
    }

    setLoading(false);
  }

  return (
    <div className='col-lg-6 col-md-6 col-sm-12 staff-input'>
    <form onSubmit={handleSubmit}>
        <p className='d-flex align-items-center justify-content-between staff-title'>Add New Staff Member</p>
        <div className='input-container'>
            <label for="fullName" class="block input-label">Full Name: </label>
            <input
            type="text"
            name="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            id="fullName"
            class="block w-full input-field"
            required
            />
            <label for="email" class="block input-label">Email: </label>
            <input
            type="text"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            id="email"
            class="block w-full input-field"
            required
            />
            <label for="staffRole" class="block input-label">Staff Role:</label>
            <select
                name="staffRole"
                value={staffRole}
                onChange={e => setStaffRole(e.target.value)}
                id="staffRole"
                className="block w-full input-field"
                required
                >
                <option value="">Select Staff Role</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Housekeepr">Housekeeper</option>
                <option value="Handyman">Handyman</option>
                <option value="Porter">Porter</option>
                </select>
            <label for="password" class="block input-label">Password:</label>
            <input
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            id="roomType"
            class="block w-full input-field"
            required
            />
            <label htmlFor="confirmPassword" className="block input-label">Confirm Password:</label>
            <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            id="confirmPassword"
            className="block w-full input-field"
            required
            />
            <button  type="submit" className="form-btn">Add New User</button>
        </div>	
    </form>
</div>
  );
};

export default AddStaff;

