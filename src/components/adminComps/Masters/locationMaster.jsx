import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Box, Card, CardContent, Typography, Divider, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText } from '@mui/material';
import { Edit, Delete, AddCircle } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function LocationMaster() {
  const [locations, setLocations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ name: '', institutionIds: [] });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch locations from Firestore
  const fetchLocations = async () => {
    try {
      const locationsCollection = collection(firestore, 'locations');
      const locationsSnapshot = await getDocs(locationsCollection);
      setLocations(locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch locations from Firestore',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  // Fetch institutions from Firestore
  const fetchInstitutions = async () => {
    try {
      const institutionsCollection = collection(firestore, 'institutions');
      const institutionsSnapshot = await getDocs(institutionsCollection);
      setInstitutions(institutionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch institutions from Firestore',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchInstitutions();
  }, []);

  const handleOpenDialog = (location = null) => {
    setIsEditMode(!!location);
    setCurrentLocation(location || { name: '', institutionIds: [] });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle multiple selections of institutions
    if (name === 'institutionIds') {
      setCurrentLocation({ ...currentLocation, institutionIds: value });
    } else {
      setCurrentLocation({ ...currentLocation, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        // Update existing location
        const locationRef = doc(firestore, 'locations', currentLocation.id);
        await updateDoc(locationRef, { name: currentLocation.name, institutionIds: currentLocation.institutionIds });
        Swal.fire({
          title: 'Success',
          text: 'Location updated successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Add new location
        await addDoc(collection(firestore, 'locations'), { name: currentLocation.name, institutionIds: currentLocation.institutionIds });
        Swal.fire({
          title: 'Success',
          text: 'Location added successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
      fetchLocations();
      handleCloseDialog();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save location',
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
      text: 'You are about to delete this location.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      position: 'center', // Set to center for delete confirmation dialog
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const locationRef = doc(firestore, 'locations', id);
          await deleteDoc(locationRef);
          return true;
        } catch (error) {
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'The location has been deleted.',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        fetchLocations();
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'The location was not deleted.',
          icon: 'info',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>Region Master</Typography>

      <Grid container spacing={4}>
        {/* Location Counter Display */}
        <Grid item xs={12}>
          <Typography variant="h6" color="textSecondary" style={{ fontWeight: 'bold' }}>
            Total Regions: {locations.length}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Regions:</Typography>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} startIcon={<AddCircle />}>
                Add Location
              </Button>
              <Divider sx={{ my: 2 }} />
              {locations.map((location) => (
                <Box key={location.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>{location.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(location)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(location.id)} color="secondary"><Delete /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Add/Edit Location */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Edit Location' : 'Add Location'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Location Name"
            name="name"
            value={currentLocation.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Institutions</InputLabel>
            <Select
              name="institutionIds"
              multiple
              value={currentLocation.institutionIds}
              onChange={handleChange}
              renderValue={(selected) => selected.map(id => institutions.find(inst => inst.id === id)?.name).join(', ')}
            >
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={institution.id}>
                  <Checkbox checked={currentLocation.institutionIds.indexOf(institution.id) > -1} />
                  <ListItemText primary={institution.name} />
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
