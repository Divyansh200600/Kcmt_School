import React, { useState, useEffect } from 'react';
import { firestore } from '../../../utils/firebaseConfig';
import { addDoc, updateDoc, deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { CircularProgress, TextField, Button, IconButton, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';

const StaffMaster = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [staffData, setStaffData] = useState({
    staffName: '',
    designation: '',
    stream: '',  // Changed from subject to stream
    location: '',
    employmentStatus: '',
  });
  const [designations, setDesignations] = useState([]);  // For dynamic designation fetch
  const [locations, setLocations] = useState([]);  // For dynamic location fetch
  const [streams, setStreams] = useState([]);  // For dynamic stream fetch
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch staff profiles, designations, locations, and streams on load
  useEffect(() => {
    const fetchStaffs = async () => {
      const staffCollection = collection(firestore, 'staff');
      const snapshot = await getDocs(staffCollection);
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffs(staffList);
      setFilteredStaffs(staffList);
    };

    const fetchDesignations = async () => {
      const designationCollection = collection(firestore, 'designations');
      const snapshot = await getDocs(designationCollection);
      const designationList = snapshot.docs.map(doc => doc.data().name);
      setDesignations(designationList);
    };

    const fetchLocations = async () => {
      const locationCollection = collection(firestore, 'locations');
      const snapshot = await getDocs(locationCollection);
      const locationList = snapshot.docs.map(doc => doc.data().name);
      setLocations(locationList);
    };

    const fetchStreams = async () => {
      const streamCollection = collection(firestore, 'streams');  // Added fetch for streams
      const snapshot = await getDocs(streamCollection);
      const streamList = snapshot.docs.map(doc => doc.data().streamName);
      setStreams(streamList);
    };

    // Fetch all data when component loads
    fetchStaffs();
    fetchDesignations();
    fetchLocations();
    fetchStreams();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle staff search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      const filtered = staffs.filter((staff) =>
        staff.staffName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredStaffs(filtered);
    } else {
      setFilteredStaffs(staffs);
    }
  };

  // Add or Update staff
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!staffData.staffName || !staffData.designation || !staffData.stream || !staffData.location || !staffData.employmentStatus) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isUpdating) {
        // Update the existing staff profile
        const staffRef = doc(firestore, 'staff', currentStaffId);
        await updateDoc(staffRef, staffData);
        Swal.fire('Success', 'Staff updated successfully', 'success');
      } else {
        // Add a new staff profile
        await addDoc(collection(firestore, 'staff'), staffData);
        Swal.fire('Success', 'Staff added successfully', 'success');
      }

      setStaffData({
        staffName: '',
        designation: '',
        stream: '',  // Resetting stream field
        location: '',
        employmentStatus: '',
      });

      setIsUpdating(false);
      setCurrentStaffId(null);

      // Refresh staff list
      const staffCollection = collection(firestore, 'staff');
      const snapshot = await getDocs(staffCollection);
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffs(staffList);
      setFilteredStaffs(staffList);

    } catch (error) {
      Swal.fire('Error', `Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle staff delete
  const handleDelete = async (staffId) => {
    try {
      setLoading(true);
      const staffRef = doc(firestore, 'staff', staffId);
      await deleteDoc(staffRef);
      Swal.fire('Success', 'Staff deleted successfully', 'success');

      // Refresh staff list
      const staffCollection = collection(firestore, 'staff');
      const snapshot = await getDocs(staffCollection);
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffs(staffList);
      setFilteredStaffs(staffList);

    } catch (error) {
      Swal.fire('Error', `Error deleting staff: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle staff edit
  const handleEdit = (staffId) => {
    const staff = staffs.find(stf => stf.id === staffId);
    setStaffData({
      staffName: staff.staffName,
      designation: staff.designation,
      stream: staff.stream,  // Changed from subject to stream
      location: staff.location,
      employmentStatus: staff.employmentStatus,
    });
    setIsUpdating(true);
    setCurrentStaffId(staffId);
  };

  return (
    <div className="flex p-6 space-x-6">
      {/* Left Side: Add/Update Staff Profile */}
      <div className="w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          {isUpdating ? 'Update Staff' : 'Add New Staff'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Staff Name"
            name="staffName"
            value={staffData.staffName}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Designation</InputLabel>
            <Select
              name="designation"
              value={staffData.designation}
              onChange={handleChange}
            >
              {designations.map((designation, index) => (
                <MenuItem key={index} value={designation}>{designation}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Stream</InputLabel>
            <Select
              name="stream"
              value={staffData.stream}
              onChange={handleChange}
            >
              {streams.map((stream, index) => (
                <MenuItem key={index} value={stream}>{stream}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Location</InputLabel>
            <Select
              name="location"
              value={staffData.location}
              onChange={handleChange}
            >
              {locations.map((location, index) => (
                <MenuItem key={index} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Employment Status</InputLabel>
            <Select
              name="employmentStatus"
              value={staffData.employmentStatus}
              onChange={handleChange}
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isUpdating ? 'Update Staff' : 'Add Staff'}
          </Button>
        </form>
      </div>

      {/* Right Side: Staff List with Search */}
      <div className="w-2/3">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">Staff List</h4>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="space-y-4">
          {filteredStaffs.map((staff) => (
            <div key={staff.id} className="flex justify-between items-center p-4 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-all">
              <div>
                <p className="font-semibold text-gray-800">{staff.staffName}</p>
                <p className="text-sm text-gray-600">{staff.designation}</p>
                <p className="text-sm text-gray-600">{staff.stream}</p> {/* Display stream instead of subject */}
                <p className="text-sm text-gray-500">{staff.location}</p>
                <p className="text-sm text-gray-500">{staff.employmentStatus}</p>
              </div>
              <div className="flex space-x-4">
                <IconButton onClick={() => handleEdit(staff.id)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(staff.id)} color="error">
                  <Delete />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffMaster;
