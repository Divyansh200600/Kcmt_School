import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Visibility, VisibilityOff, Delete as DeleteIcon } from '@mui/icons-material';
import { CircularProgress, TextField, IconButton, Button, Typography, Box, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AddUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    password: '',
    department: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments] = useState(['BCA', 'MCA', 'BBA', 'MBA', 'BSc', 'MSc', 'Science', 'BCom Hons.']);
  const navigate = useNavigate(); // Initialize navigate function

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

    if (!userData.email || !userData.password || !userData.username || !userData.role || !userData.department) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      const newUserUID = await generateUID(userData.department);

      await setDoc(doc(firestore, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: userData.password,
        department: userData.department,
        uid: newUserUID,
        timestamp: new Date().toISOString(),
      });

      setUserData({
        username: '',
        email: '',
        role: '',
        password: '',
        department: '',
      });

      const usersList = await fetchUsers();
      setUsers(usersList);

      Swal.fire('Success', 'User successfully added', 'success');

      // Optional: Navigate to another page after adding the user if needed
      // Example: navigate('/dashboard'); 
      
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

  const generateUID = async (department) => {
    const usersCollection = collection(firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    const departmentUsers = snapshot.docs.filter((doc) => doc.data().department === department);
    const nextId = departmentUsers.length + 101;
    return `${department}-${nextId}`;
  };

  const columns = [
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 0.5 },
    { field: 'department', headerName: 'Department', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={3} padding={3}>
      <Grid item xs={12} md={4}>
        <Box padding={3} bgcolor="white" borderRadius={3} boxShadow={3}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Add New User
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select name="role" value={userData.role} onChange={handleChange} required>
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select name="department" value={userData.department} onChange={handleChange} required>
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              value={userData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Add User'}
            </Button>
          </form>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        <Box padding={3} bgcolor="white" borderRadius={3} boxShadow={3}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Users List
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search Users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          {dataLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress size={50} />
            </Box>
          ) : (
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              autoHeight
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AddUser;