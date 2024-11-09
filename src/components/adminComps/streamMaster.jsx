import React, { useState, useEffect } from 'react';
import { firestore } from '../../utils/firebaseConfig';
import { addDoc, updateDoc, deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { CircularProgress, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';

const StreamMaster = () => {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [streamData, setStreamData] = useState({
    streamName: '',
    streamCode: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch streams on load
  useEffect(() => {
    const fetchStreams = async () => {
      const streamsCollection = collection(firestore, 'streams');
      const snapshot = await getDocs(streamsCollection);
      const streamsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStreams(streamsList);
      setFilteredStreams(streamsList);
    };
    fetchStreams();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStreamData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle stream search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      const filtered = streams.filter((stream) =>
        stream.streamName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredStreams(filtered);
    } else {
      setFilteredStreams(streams);
    }
  };

  // Add or Update stream
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!streamData.streamName || !streamData.streamCode || !streamData.description) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isUpdating) {
        // Update the existing stream
        const streamRef = doc(firestore, 'streams', currentStreamId);
        await updateDoc(streamRef, streamData);
        Swal.fire('Success', 'Stream updated successfully', 'success');
      } else {
        // Add a new stream
        await addDoc(collection(firestore, 'streams'), streamData);
        Swal.fire('Success', 'Stream added successfully', 'success');
      }

      setStreamData({
        streamName: '',
        streamCode: '',
        description: '',
      });

      setIsUpdating(false);
      setCurrentStreamId(null);
      
      // Refresh streams list
      const streamsCollection = collection(firestore, 'streams');
      const snapshot = await getDocs(streamsCollection);
      const streamsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStreams(streamsList);
      setFilteredStreams(streamsList);

    } catch (error) {
      Swal.fire('Error', `Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle stream delete
  const handleDelete = async (streamId) => {
    try {
      setLoading(true);
      const streamRef = doc(firestore, 'streams', streamId);
      await deleteDoc(streamRef);
      Swal.fire('Success', 'Stream deleted successfully', 'success');
      
      // Refresh streams list
      const streamsCollection = collection(firestore, 'streams');
      const snapshot = await getDocs(streamsCollection);
      const streamsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStreams(streamsList);
      setFilteredStreams(streamsList);
      
    } catch (error) {
      Swal.fire('Error', `Error deleting stream: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle stream edit
  const handleEdit = (streamId) => {
    const stream = streams.find(str => str.id === streamId);
    setStreamData({
      streamName: stream.streamName,
      streamCode: stream.streamCode,
      description: stream.description,
    });
    setIsUpdating(true);
    setCurrentStreamId(streamId);
  };

  return (
    <div className="flex p-6 space-x-6">
      {/* Left Side: Add Stream Area */}
      <div className="w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          {isUpdating ? 'Update Stream' : 'Add New Stream'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Stream Name"
            name="streamName"
            value={streamData.streamName}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Stream Code"
            name="streamCode"
            value={streamData.streamCode}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={streamData.description}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={4}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isUpdating ? 'Update Stream' : 'Add Stream'}
          </Button>
        </form>
      </div>

      {/* Right Side: Stream List with Search */}
      <div className="w-2/3">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">Streams List</h4>
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
          {filteredStreams.map((stream) => (
            <div key={stream.id} className="flex justify-between items-center p-4 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-all">
              <div>
                <p className="font-semibold text-gray-800">{stream.streamName}</p>
                <p className="text-sm text-gray-600">{stream.streamCode}</p>
                <p className="text-sm text-gray-500">{stream.description}</p>
              </div>
              <div className="flex space-x-4">
                <IconButton onClick={() => handleEdit(stream.id)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(stream.id)} color="error">
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

export default StreamMaster;
