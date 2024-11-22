import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Edit, Delete, AddCircle } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const InstitutionMaster = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState({ name: '', code: '', address: '', contact: '', type: '' });
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const types = ['School', 'College', 'Coaching', 'Tutor', 'Internet', 'Book Store'];

  // Fetch institutions from Firestore in real-time
  useEffect(() => {
    const institutionsCollection = collection(firestore, 'institutions');
    
    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(institutionsCollection, (snapshot) => {
      const institutionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInstitutions(institutionList);
      setLoading(false); // Set loading to false once the data is loaded
    }, (error) => {
      Swal.fire('Error', 'Failed to load institutions', 'error');
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Handle open dialog for adding/editing institution
  const handleOpenDialog = (institution = null) => {
    if (institution) {
      setEditMode(true);
      setCurrentInstitution(institution);
    } else {
      setEditMode(false);
      setCurrentInstitution({ name: '', code: '', address: '', contact: '', type: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentInstitution({ ...currentInstitution, [name]: value });
  };

  // Handle save institution
  const handleSaveInstitution = async () => {
    if (!currentInstitution.name || !currentInstitution.code || !currentInstitution.address || !currentInstitution.contact || !currentInstitution.type) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    if (editMode) {
      // Update institution
      const institutionDoc = doc(firestore, 'institutions', currentInstitution.id);
      try {
        await updateDoc(institutionDoc, currentInstitution);
        Swal.fire('Success', 'Institution updated successfully', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to update institution', 'error');
      }
    } else {
      // Add new institution
      const institutionsCollection = collection(firestore, 'institutions');
      try {
        const docRef = await addDoc(institutionsCollection, currentInstitution);
        Swal.fire('Success', 'Institution added successfully', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to add institution', 'error');
      }
    }
    handleCloseDialog();
  };

  // Handle delete institution with confirmation
  const handleDeleteInstitution = async (institutionId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const institutionDoc = doc(firestore, 'institutions', institutionId);
        try {
          await deleteDoc(institutionDoc);
          Swal.fire('Deleted!', 'The institution has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error', 'Failed to delete institution', 'error');
        }
      }
    });
  };

  // Filter institutions based on search query
  const filteredInstitutions = institutions.filter((institution) =>
    institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institution.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institution.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institution.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institution.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Institution Management</h2>

      {/* Display total count of institutions */}
      <div className="mb-6 text-center">
        <span className="text-xl font-medium">Total Institutions: {institutions.length}</span>
      </div>

      {/* Search bar for searching institutions */}
      <div className="mb-6">
        <TextField
          label="Search Institutions"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} startIcon={<AddCircle />}>
          Add Institution
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Code</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">Contact</th>
              <th className="py-3 px-6 text-left">Type</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstitutions.map((institution) => (
              <tr key={institution.id} className="hover:bg-gray-100 transition-all">
                <td className="py-3 px-6">{institution.name}</td>
                <td className="py-3 px-6">{institution.code}</td>
                <td className="py-3 px-6">{institution.address}</td>
                <td className="py-3 px-6">{institution.contact}</td>
                <td className="py-3 px-6">{institution.type}</td>
                <td className="py-3 px-6 text-center">
                  <IconButton color="primary" onClick={() => handleOpenDialog(institution)} aria-label="edit">
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDeleteInstitution(institution.id)} aria-label="delete">
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Dialog for adding/editing institutions */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Edit Institution' : 'Add Institution'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={currentInstitution.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Code"
            name="code"
            value={currentInstitution.code}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            value={currentInstitution.address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={currentInstitution.contact}
            onChange={handleChange}
            fullWidth
          />

          {/* Select Type */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="select-type-label">Select Type</InputLabel>
            <Select
              labelId="select-type-label"
              name="type"
              value={currentInstitution.type || ''}
              onChange={handleChange}
              displayEmpty
            >
              {types.map((type, index) => (
                <MenuItem key={index} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSaveInstitution} color="primary">{editMode ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InstitutionMaster;
