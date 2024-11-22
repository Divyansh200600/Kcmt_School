import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Box, Card, CardContent, Typography, Divider, Select, MenuItem, FormControl, InputLabel, InputAdornment } from '@mui/material';
import { Edit, Delete, AddCircle, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function DesignationMaster() {
  const [designations, setDesignations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDesignation, setCurrentDesignation] = useState({ name: '', isCustom: false });
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDesignation, setNewDesignation] = useState('');

  // Predefined Designations
  const predefinedDesignations = [
    'Principal',
    'Vice Principal',
    'Manager',
    'Co-ordinator',
    'Director',
    'HOD',
    'PGT',
    'Tutor'
  ];

  // Fetch designations from Firestore
  const fetchData = async () => {
    try {
      const designationsCollection = collection(firestore, 'designations');
      const designationsSnapshot = await getDocs(designationsCollection);
      setDesignations(designationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch data from Firestore',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (designation = null) => {
    setIsEditMode(!!designation);
    setCurrentDesignation(designation || { name: '', isCustom: false });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDesignation({ ...currentDesignation, [name]: value });
  };

  const handleSave = async () => {
    // If user is adding a custom designation
    if (currentDesignation.isCustom && !newDesignation) {
      Swal.fire({
        title: 'Error',
        text: 'Custom designation name is required',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      if (isEditMode) {
        // Update existing designation
        const designationRef = doc(firestore, 'designations', currentDesignation.id);
        await updateDoc(designationRef, { name: currentDesignation.name });
        Swal.fire({
          title: 'Success',
          text: 'Designation updated successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Add new designation, either from the dropdown or custom
        const designationToSave = currentDesignation.isCustom ? { name: newDesignation } : { name: currentDesignation.name };
        await addDoc(collection(firestore, 'designations'), designationToSave);
        Swal.fire({
          title: 'Success',
          text: 'Designation added successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save designation',
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
      text: 'You are about to delete this designation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      position: 'top-end',
      toast: true,
      timer: 3000
    }).then(async (result) => {
      if (result.isConfirmed) {
        const designationRef = doc(firestore, 'designations', id);
        await deleteDoc(designationRef);
        Swal.fire({
          title: 'Deleted!',
          text: 'The designation has been deleted.',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });

        fetchData();
      }
    });
  };

  const filteredDesignations = designations.filter(designation =>
    designation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>Designation Master</Typography>

      <Box mb={3}>
        <TextField
          label="Search Designation"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Designations</Typography>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} startIcon={<AddCircle />}>
                Add Designation
              </Button>
              <Divider sx={{ my: 2 }} />
              {filteredDesignations.map((designation) => (
                <Box key={designation.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>{designation.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(designation)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(designation.id)} color="secondary"><Delete /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Add/Edit Designation */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Designation</InputLabel>
            <Select
              name="name"
              value={currentDesignation.name || ''}
              onChange={handleChange}
            >
              {/* Predefined Designations */}
              {predefinedDesignations.map((designation, index) => (
                <MenuItem key={index} value={designation}>
                  {designation}
                </MenuItem>
              ))}
              {/* Option to add custom designation */}
              <MenuItem value="" onClick={() => setCurrentDesignation({ ...currentDesignation, isCustom: true })}>
                Add Custom Designation
              </MenuItem>
            </Select>
          </FormControl>

          {/* Custom Designation Input */}
          {currentDesignation.isCustom && (
            <TextField
              label="Enter Custom Designation"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              fullWidth
              margin="dense"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
