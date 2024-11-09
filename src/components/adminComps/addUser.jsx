import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Visibility, VisibilityOff, Search, Delete as DeleteIcon } from '@mui/icons-material';
import { CircularProgress, TextField, IconButton, Button, Typography } from '@mui/material';

const AddUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    password: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      setDataLoading(true);
      const usersList = await fetchUsers();
      setUsers(usersList);
      setDataLoading(false);
    };
    getUsers();
  }, []);

  const fetchUsers = async () => {
    const usersCollection = collection(firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.email || !userData.password || !userData.username || !userData.role) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: userData.password, 
        timestamp: new Date().toISOString(),
      });

      setUserData({
        username: '',
        email: '',
        role: '',
        password: '',
      });

      const usersList = await fetchUsers();
      setUsers(usersList);

      Swal.fire('Success', 'User successfully added to Firestore', 'success');
    } catch (error) {
      Swal.fire('Error', `Error adding user: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(firestore, 'users', userId));

      const usersList = await fetchUsers();
      setUsers(usersList);

      Swal.fire('Success', 'User successfully deleted', 'success');
    } catch (error) {
      Swal.fire('Error', `Error deleting user: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the search query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate users and admins
  const admins = filteredUsers.filter(user => user.role === 'admin');
  const normalUsers = filteredUsers.filter(user => user.role === 'user');

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
              className="absolute bottom-0 right-4 transform -translate-y-1/2"
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
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>

      {/* Right side: Users List */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Users List</h3>
        <div className="mb-4 relative">
          <TextField
            variant="outlined"
            placeholder="Search Users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <Search className="text-gray-600" />
              ),
            }}
          />
        </div>
        {dataLoading ? (
          <div className="flex justify-center items-center space-x-4">
            <CircularProgress size={50} />
            <span>Loading Users...</span>
          </div>
        ) : (
          <>
            {admins.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Admins</h4>
                <div className="space-y-4">
                  {admins.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex justify-between items-center p-4 rounded-md shadow-md transition-all hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <div>
                        <Typography variant="h6" className="font-semibold text-gray-800">{user.username}</Typography>
                        <Typography variant="body2" className="text-gray-600">{user.email}</Typography>
                      </div>
                      <IconButton
                        onClick={() => handleDelete(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {normalUsers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Users</h4>
                <div className="space-y-4">
                  {normalUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex justify-between items-center p-4 rounded-md shadow-md transition-all hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <div>
                        <Typography variant="h6" className="font-semibold text-gray-800">{user.username}</Typography>
                        <Typography variant="body2" className="text-gray-600">{user.email}</Typography>
                      </div>
                      <IconButton
                        onClick={() => handleDelete(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddUser;
