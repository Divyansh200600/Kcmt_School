import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // SweetAlert2 for notifications
import { Visibility, VisibilityOff } from '@mui/icons-material'; // MUI icons for password visibility
import { CircularProgress } from '@mui/material'; // Material UI loader

const AddUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    password: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle password visibility
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state for async operations
  const [dataLoading, setDataLoading] = useState(false); // Loader for data fetching

  useEffect(() => {
    // Fetch users from Firestore when the component mounts
    const getUsers = async () => {
      setDataLoading(true);
      const usersList = await fetchUsers();
      setUsers(usersList);
      setDataLoading(false);
    };
    getUsers();
  }, []);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    const usersCollection = collection(firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.email || !userData.password || !userData.username || !userData.role) {
      Swal.fire('Error', 'Please fill in all fields', 'error'); // SweetAlert2 error message
      return;
    }

    try {
      setLoading(true); // Show loader while submitting the form
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;

      // Save user data to Firestore, including the password (not recommended in production)
      await setDoc(doc(firestore, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: userData.password, // Saving password to Firestore (consider hashing in production)
        timestamp: new Date().toISOString(),
      });

      // Reset the form
      setUserData({
        username: '',
        email: '',
        role: '',
        password: '',
      });

      // Fetch updated list of users
      const usersList = await fetchUsers();
      setUsers(usersList);

      Swal.fire('Success', 'User successfully added to Firestore', 'success'); // SweetAlert2 success message
    } catch (error) {
      Swal.fire('Error', `Error adding user: ${error.message}`, 'error'); // SweetAlert2 error message
    } finally {
      setLoading(false); // Hide loader after submission
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    try {
      setLoading(true); // Show loader while deleting user
      await deleteDoc(doc(firestore, 'users', userId));
      console.log('User successfully deleted');
      
      // Fetch updated list of users
      const usersList = await fetchUsers();
      setUsers(usersList);

      Swal.fire('Success', 'User successfully deleted', 'success'); // SweetAlert2 success message
    } catch (error) {
      Swal.fire('Error', `Error deleting user: ${error.message}`, 'error'); // SweetAlert2 error message
    } finally {
      setLoading(false); // Hide loader after deletion
    }
  };

  return (
    <div className="flex space-x-6 p-6">
      {/* Left side: Add User Form */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700">Role</label>
            <select
              id="role"
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-4 transform -translate-y-1/2"
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            >
              {passwordVisible ? (
                <VisibilityOff className="text-gray-600" />
              ) : (
                <Visibility className="text-gray-600" />
              )}
            </button>
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all w-full"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" /> // Show circular loader when loading
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>

      {/* Right side: Display Saved Users */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Users List</h3>
        {dataLoading ? (
          <div className="flex justify-center items-center space-x-4">
            <CircularProgress size={50} />
            <span>Loading Users...</span>
          </div>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="flex justify-between items-center">
                <div>
                  <strong>{user.username}</strong> ({user.role})
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  disabled={loading} // Disable button when loading
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddUser;
