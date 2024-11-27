import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Box, Card, CardContent, Typography, Divider, InputAdornment, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, List, ListItem } from '@mui/material';
import { Edit, Delete, AddCircle, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig'; 
import { collection, onSnapshot, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function BoardMaster() {
  const [boards, setBoards] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({ name: '', institutionIds: [] }); // Change to handle multiple institutionIds
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Use onSnapshot to listen to real-time updates for boards
  useEffect(() => {
    fetchInstitutions();
    const boardsCollection = collection(firestore, 'levels_and_boards');
    const unsubscribe = onSnapshot(boardsCollection, (snapshot) => {
      const boardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBoards(boardsData.filter(board => board.type === 'board')); // Only get boards
    });

    return () => unsubscribe();
  }, []);

  // Open dialog for adding or editing a board
  const handleOpenDialog = (board = null) => {
    setIsEditMode(!!board);
    setCurrentItem(board ? { ...board, institutionIds: board.institutionIds || [] } : { name: '', institutionIds: [] });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => setOpenDialog(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  // Handle institution selection (checkboxes)
  const handleInstitutionChange = (event) => {
    const { value } = event.target;
    setCurrentItem({
      ...currentItem,
      institutionIds: value,
    });
  };

  // Save or update board
  const handleSave = async () => {
    if (!currentItem.name || currentItem.institutionIds.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Name and at least one institution must be selected.',
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
        // Update existing board
        const boardRef = doc(firestore, 'levels_and_boards', currentItem.id);
        await updateDoc(boardRef, currentItem);
        Swal.fire({
          title: 'Success',
          text: 'Board updated successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Add new board
        await addDoc(collection(firestore, 'levels_and_boards'), { ...currentItem, type: 'board' });
        Swal.fire({
          title: 'Success',
          text: 'Board added successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
      handleCloseDialog(); // Close dialog after save
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save board',
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
      text: 'You are about to delete this board.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      position: 'center',  
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const boardRef = doc(firestore, 'levels_and_boards', id);
          await deleteDoc(boardRef);
          return true;
        } catch (error) {
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'The board has been deleted.',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
        });
      } else if (result.isDismissed) {
        Swal.fire({
          title: 'Cancelled',
          text: 'The board was not deleted.',
          icon: 'info',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter boards based on search query
  const filteredBoards = boards.filter(board => board.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>Board Master</Typography>

      <Box mb={3}>
        <TextField
          label="Search"
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
              <Typography variant="h6">Boards</Typography>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog(null)} startIcon={<AddCircle />}>
                Add Board
              </Button>
              <Divider sx={{ my: 2 }} />
              {filteredBoards.map((board) => (
                <Box key={board.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>{board.name}</Typography>
                  <Typography>
                    <div className='text-green-500 font-bold'> {institutions.find(inst => inst.id === board.institutionId)?.name}</div> 
                  </Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(board)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(board.id)} color="secondary"><Delete /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Add/Edit Board */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? `Edit Board` : `Add Board`}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={currentItem.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Institutions</InputLabel>
            <Select
              multiple
              name="institutionIds"
              value={currentItem.institutionIds}
              onChange={handleInstitutionChange}
              renderValue={(selected) => selected.map(id => institutions.find(inst => inst.id === id)?.name).join(', ')}
            >
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={institution.id}>
                  <Checkbox checked={currentItem.institutionIds.indexOf(institution.id) > -1} />
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
