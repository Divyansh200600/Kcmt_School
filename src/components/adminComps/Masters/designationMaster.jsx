import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Box, Card, CardContent, Typography, Divider, Checkbox, FormControlLabel } from '@mui/material';
import { Edit, Delete, AddCircle, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function DesignationMaster() {
  const [designations, setDesignations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDesignation, setCurrentDesignation] = useState({ name: '', isCustom: false });
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]); // To track selected predefined roles
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

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentDesignation({ name: '', isCustom: false });
    setSelectedRoles([]); // Reset selected roles
    setNewDesignation(''); // Reset custom designation
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleRoleSelection = (role) => {
    setSelectedRoles((prevSelected) =>
      prevSelected.includes(role)
        ? prevSelected.filter((item) => item !== role) // Unselect role
        : [...prevSelected, role] // Select role
    );
  };

  // Check if designation already exists in Firestore
  const checkIfDesignationExists = async (designationName) => {
    try {
      const designationsCollection = collection(firestore, 'designations');
      const designationsSnapshot = await getDocs(designationsCollection);
      const existingDesignation = designationsSnapshot.docs.find((doc) => doc.data().name.toLowerCase() === designationName.toLowerCase());
      return existingDesignation !== undefined;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0 && !newDesignation.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please select at least one role or enter a custom designation.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Convert the custom designation to uppercase
    const rolesToAdd = [
      ...selectedRoles.map((role) => ({ name: role })),
      ...(newDesignation ? [{ name: newDesignation.toUpperCase() }] : [])
    ];

    for (let role of rolesToAdd) {
      const exists = await checkIfDesignationExists(role.name);
      if (exists) {
        Swal.fire({
          title: 'Error',
          text: `${role.name} already exists.`,
          icon: 'error',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }
    }

    try {
      const batchPromises = rolesToAdd.map((role) =>
        addDoc(collection(firestore, 'designations'), role)
      );

      await Promise.all(batchPromises);

      Swal.fire({
        title: 'Success',
        text: 'Designations added successfully',
        icon: 'success',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });

      fetchData();
      handleCloseDialog();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save designations',
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
      position: 'center',  // Show in the center for delete confirmation
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const designationRef = doc(firestore, 'designations', id);
          await deleteDoc(designationRef);
          return true;
        } catch (error) {
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'The designation has been deleted.',
          icon: 'success',
          position: 'top-end', // Notification at the top-right
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });

        fetchData();
      } else if (result.isDismissed) {
        Swal.fire({
          title: 'Cancelled',
          text: 'The designation was not deleted.',
          icon: 'info',
          position: 'top-end', // Notification at the top-right
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredDesignations = designations.filter((designation) =>
    designation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Designation Master
      </Typography>

      <Box mb={3}>
        <TextField
          label="Search Designation"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search position="start" />
            )
          }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Designations</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDialog}
                startIcon={<AddCircle />}
              >
                Add Designation
              </Button>
              <Divider sx={{ my: 2 }} />
              {filteredDesignations.map((designation) => (
                <Box key={designation.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>{designation.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleDelete(designation.id)} color="secondary">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Add Designation */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Designation</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Select Predefined Roles</Typography>
          {predefinedDesignations.map((role) => (
            <FormControlLabel
              key={role}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleSelection(role)}
                />
              }
              label={role}
            />
          ))}

          <Typography variant="subtitle1" style={{ marginTop: '16px' }}>
            Or Add Custom Designation
          </Typography>
          <TextField
            label="Custom Designation"
            value={newDesignation.toUpperCase()}  // Always display in uppercase
            onChange={(e) => setNewDesignation(e.target.value.toUpperCase())} // Convert to uppercase on change
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
