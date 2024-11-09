import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Box, Typography, Divider, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { firestore } from '../../utils/firebaseConfig';
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { AddCircle } from '@mui/icons-material';

export default function LocationSub() {
  const { locationId } = useParams(); // Get locationId from URL parameters
  const [locationDetails, setLocationDetails] = useState({ name: '', institutionId: '' });
  const [subLocations, setSubLocations] = useState([]); // To store sub-locations of the current location
  const [institutions, setInstitutions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSubLocation, setCurrentSubLocation] = useState({ name: '', institutionId: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch the details of the main location (region, city, etc.)
  const fetchLocationDetails = async () => {
    try {
      const locationRef = doc(firestore, 'locations', locationId);
      const locationSnap = await getDoc(locationRef);
      if (locationSnap.exists()) {
        setLocationDetails({ id: locationSnap.id, ...locationSnap.data() });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch location details from Firestore.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  // Fetch institutions to link to sub-locations
  const fetchInstitutions = async () => {
    try {
      const institutionsCollection = collection(firestore, 'institutions');
      const institutionsSnapshot = await getDocs(institutionsCollection);
      setInstitutions(institutionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch institutions from Firestore.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  // Fetch sub-locations for the current location
  const fetchSubLocations = async () => {
    try {
      const subLocationsCollection = collection(firestore, 'locations', locationId, 'subLocations');
      const subLocationsSnapshot = await getDocs(subLocationsCollection);
      setSubLocations(subLocationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch sub-locations from Firestore.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  useEffect(() => {
    fetchLocationDetails();
    fetchInstitutions();
    fetchSubLocations();
  }, [locationId]);

  const handleOpenDialog = (subLocation = null) => {
    setIsEditMode(!!subLocation);
    setCurrentSubLocation(subLocation || { name: '', institutionId: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubLocation({ ...currentSubLocation, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        // Update existing sub-location
        const subLocationRef = doc(firestore, 'locations', locationId, 'subLocations', currentSubLocation.id);
        await updateDoc(subLocationRef, { name: currentSubLocation.name, institutionId: currentSubLocation.institutionId });
        Swal.fire({
          title: 'Success',
          text: 'Sub-location updated successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Add new sub-location
        await addDoc(collection(firestore, 'locations', locationId, 'subLocations'), { name: currentSubLocation.name, institutionId: currentSubLocation.institutionId });
        Swal.fire({
          title: 'Success',
          text: 'Sub-location added successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
      fetchSubLocations();
      handleCloseDialog();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save sub-location',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this sub-location.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      position: 'top-end',
      toast: true,
      timer: 3000
    }).then(async (result) => {
      if (result.isConfirmed) {
        const subLocationRef = doc(firestore, 'locations', locationId, 'subLocations', id);
        await deleteDoc(subLocationRef);
        Swal.fire({
          title: 'Deleted!',
          text: 'The sub-location has been deleted.',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        fetchSubLocations();
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>Sub-Location Management</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h6">Main Location: {locationDetails.name}</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} startIcon={<AddCircle />}>
            Add Sub-Location
          </Button>
          <Divider sx={{ my: 2 }} />
          {subLocations.map((subLocation) => (
            <Box key={subLocation.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography>{subLocation.name}</Typography>
              <Box>
                <Button onClick={() => handleOpenDialog(subLocation)} color="primary">Edit</Button>
                <Button onClick={() => handleDelete(subLocation.id)} color="secondary">Delete</Button>
              </Box>
            </Box>
          ))}
        </Grid>
      </Grid>

      {/* Dialog for Add/Edit Sub-location */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Edit Sub-location' : 'Add Sub-location'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Sub-location Name"
            name="name"
            value={currentSubLocation.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Institution</InputLabel>
            <Select
              name="institutionId"
              value={currentSubLocation.institutionId}
              onChange={handleChange}
            >
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={institution.id}>
                  {institution.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
