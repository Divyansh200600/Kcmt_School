import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Box, Card, CardContent, Typography, Divider, Select, MenuItem, FormControl, InputLabel, InputAdornment } from '@mui/material';
import { Edit, Delete, AddCircle, Search, CheckCircle, Cancel } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function SessionMaster() {
  const [sessions, setSessions] = useState([]);
  const [institutions, setInstitutions] = useState([]); // Institutions state
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSession, setCurrentSession] = useState({ name: '', isActive: true, institutionId: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions from Firestore
  const fetchData = async () => {
    try {
      const sessionsCollection = collection(firestore, 'sessions');
      const sessionsSnapshot = await getDocs(sessionsCollection);
      setSessions(sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch sessions from Firestore',
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
    fetchData();
    fetchInstitutions();
  }, []);

  const handleOpenDialog = (session = null) => {
    setIsEditMode(!!session);
    setCurrentSession(session || { name: '', isActive: true, institutionId: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSession({ ...currentSession, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        // Update existing session
        const sessionRef = doc(firestore, 'sessions', currentSession.id);
        await updateDoc(sessionRef, { name: currentSession.name, isActive: currentSession.isActive, institutionId: currentSession.institutionId });
        Swal.fire({
          title: 'Success',
          text: 'Session updated successfully',
          icon: 'success',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Add new session
        await addDoc(collection(firestore, 'sessions'), { name: currentSession.name, isActive: currentSession.isActive, institutionId: currentSession.institutionId });
        Swal.fire({
          title: 'Success',
          text: 'Session added successfully',
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
        text: 'Failed to save session',
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
      text: 'You are about to delete this session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      position: 'top-end',
      toast: true,
      timer: 3000
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sessionRef = doc(firestore, 'sessions', id);
        await deleteDoc(sessionRef);
        Swal.fire({
          title: 'Deleted!',
          text: 'The session has been deleted.',
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

  const handleActivateDeactivate = async (id, isActive) => {
    const sessionRef = doc(firestore, 'sessions', id);
    await updateDoc(sessionRef, { isActive: !isActive });
    Swal.fire({
      title: 'Success',
      text: `Session has been ${!isActive ? 'activated' : 'deactivated'}`,
      icon: 'success',
      position: 'top-end',
      toast: true,
      timer: 3000,
      showConfirmButton: false
    });
    fetchData();
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>Session Master</Typography>

      <Box mb={3}>
        <TextField
          label="Search Session"
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
              <Typography variant="h6">Sessions</Typography>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} startIcon={<AddCircle />}>
                Add Session
              </Button>
              <Divider sx={{ my: 2 }} />
              {filteredSessions.map((session) => (
                <Box key={session.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>{session.name} {session.isActive ? '(Active)' : '(Inactive)'}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(session)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(session.id)} color="secondary"><Delete /></IconButton>
                    <IconButton onClick={() => handleActivateDeactivate(session.id, session.isActive)} color={session.isActive ? 'error' : 'primary'}>
                      {session.isActive ? <Cancel /> : <CheckCircle />}
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Add/Edit Session */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Edit Session' : 'Add Session'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Session Name"
            name="name"
            value={currentSession.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Session Status</InputLabel>
            <Select
              name="isActive"
              value={currentSession.isActive}
              onChange={handleChange}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Institution</InputLabel>
            <Select
              name="institutionId"
              value={currentSession.institutionId}
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
