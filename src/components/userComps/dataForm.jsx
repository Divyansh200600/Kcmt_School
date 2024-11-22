import React, { useState, useEffect } from 'react';
import {
    TextField, Grid, Box, Button, Typography, IconButton, Paper, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { AddCircle, RemoveCircle, Save, Upload as UploadIcon, Delete } from '@mui/icons-material';
import { auth, firestore, storage } from '../../utils/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import CircularProgress from '@mui/material/CircularProgress';

const DataForm = () => {
    const [graduationTeachers, setGraduationTeachers] = useState([{ id: Date.now() }]);
    const [pgtTeachers, setPgtTeachers] = useState([{ id: Date.now() }]);
    const [isLoading, setIsLoading] = useState(false);

    const [userDetails, setUserDetails] = useState(null);
    const [boards, setBoards] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [errors, setErrors] = useState({});
    const [files, setFiles] = useState([]);

    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [date, setDate] = useState('');
    const [noOfStudents, setNoOfStudents] = useState('');
    const [topicCovered, setTopicCovered] = useState('');
    const [visitRemark, setVisitRemark] = useState('');

    // Add these state variables for Principal Information
    const [principalName, setPrincipalName] = useState('');
    const [principalContactNo, setPrincipalContactNo] = useState('');
    const [principalDob, setPrincipalDob] = useState('');
    const [principalDoa, setPrincipalDoa] = useState('');
    const [principalEmail, setPrincipalEmail] = useState('');
    const user = auth.currentUser;

    const [strengths, setStrengths] = useState({
        pcm: { in12: '', coaching: '' },
        pcb: { in12: '', coaching: '' },
        commerce: { in12: '', coaching: '' },
        humanities: { in12: '', coaching: '' },
        other: { in12: '', coaching: '' },
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(firestore, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserDetails(userDocSnap.data());
                } else {
                    console.log("No user document found in Firestore!");
                }
            } else {
                setUserDetails(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const boardsRef = collection(firestore, 'levels_and_boards');
                const boardSnapshot = await getDocs(boardsRef);
                const boardList = boardSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setBoards(boardList);
            } catch (error) {
                console.error('Error fetching boards:', error);
            }
        };

        const fetchRegions = async () => {
            try {
                const regionsRef = collection(firestore, 'locations');
                const regionSnapshot = await getDocs(regionsRef);
                const regionList = regionSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setRegions(regionList);
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };

        fetchBoards();
        fetchRegions();
    }, []);

    const handleBoardChange = (event) => {
        setSelectedBoard(event.target.value);
    };

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
    };

    const validateForm = () => {
        const newErrors = {};
        graduationTeachers.forEach((teacher, index) => {
            if (!teacher.name) newErrors[`graduationName-${index}`] = 'Name is required';
            if (!teacher.contactNo) newErrors[`graduationContactNo-${index}`] = 'Contact No is required';
        });
        pgtTeachers.forEach((teacher, index) => {
            if (!teacher.name) newErrors[`pgtName-${index}`] = 'Name is required';
            if (!teacher.contactNo) newErrors[`pgtContactNo-${index}`] = 'Contact No is required';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddGraduationTeacher = () => {
        setGraduationTeachers([...graduationTeachers, { id: Date.now() }]);
    };

    const handleRemoveGraduationTeacher = (id) => {
        setGraduationTeachers(graduationTeachers.filter(teacher => teacher.id !== id));
    };

    const handleAddPgtTeacher = () => {
        setPgtTeachers([...pgtTeachers, { id: Date.now() }]);
    };

    const handleRemovePgtTeacher = (id) => {
        setPgtTeachers(pgtTeachers.filter(teacher => teacher.id !== id));
    };

    const handleStrengthChange = (field, key, value) => {
        setStrengths(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [key]: value
            }
        }));
    };

    const handleChangeFiles = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles([...files, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, fileIndex) => fileIndex !== index));
    };


    const handleSubmit = async () => {
        if (validateForm()) {
            setIsLoading(true); // Show loader
            const dataFormId = `DF-${Date.now()}`; // Generate unique dataFormId

            // Upload files to storage and get URLs
            const uploadFiles = async (file) => {
                const fileRef = ref(storage, `users/${user.uid}/dataForms/${dataFormId}/${file.name}`);
                await uploadBytes(fileRef, file);
                return await getDownloadURL(fileRef);
            };

            try {
                // Map file URLs
                const uploadedFileURLs = await Promise.all(files.map(file => uploadFiles(file)));

                // Prepare data for Firestore including the new fields
                const dataToSave = {
                    userDetails,
                    graduationTeachers: graduationTeachers.map(teacher => ({
                        ...teacher,
                        name: teacher.name || '',
                        contactNo: teacher.contactNo || '',
                        dob: teacher.dob || '',
                        doa: teacher.doa || '',
                        subject: teacher.subject || '',
                        email: teacher.email || ''
                    })),
                    pgtTeachers: pgtTeachers.map(teacher => ({
                        ...teacher,
                        name: teacher.name || '',
                        contactNo: teacher.contactNo || '',
                        dob: teacher.dob || '',
                        doa: teacher.doa || '',
                        subject: teacher.subject || '',
                        email: teacher.email || ''
                    })),
                    strengths,
                    selectedBoard,
                    selectedRegion,
                    principalInfo: {
                        name: principalName,
                        contactNo: principalContactNo,
                        dob: principalDob,
                        doa: principalDoa,
                        email: principalEmail,
                    },
                    schoolDetails: {
                        schoolName,
                        schoolAddress,
                        date,
                        noOfStudents,
                        topicCovered,
                        visitRemark,
                    },
                    documentUrls: uploadedFileURLs,
                };

                // Save to Firestore
                await setDoc(doc(firestore, `users/${user.uid}/dataForms/${dataFormId}`), dataToSave);

                // Success notification
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Form submitted successfully!',
                    toast: true,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 1500
                });

                // Clear form fields
                setGraduationTeachers([{ id: Date.now() }]);
                setPgtTeachers([{ id: Date.now() }]);
                setFiles([]);
                setSchoolName('');
                setSchoolAddress('');
                setDate('');
                setNoOfStudents('');
                setTopicCovered('');
                setVisitRemark('');
                setStrengths({
                    pcm: { in12: '', coaching: '' },
                    pcb: { in12: '', coaching: '' },
                    commerce: { in12: '', coaching: '' },
                    humanities: { in12: '', coaching: '' },
                    other: { in12: '', coaching: '' },
                });
                setPrincipalName('');
                setPrincipalContactNo('');
                setPrincipalDob('');
                setPrincipalDoa('');
                setPrincipalEmail('');
                setSelectedBoard('');
                setSelectedRegion('');


            } catch (error) {
                console.error('Error submitting form:', error);
                // Error notification
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'An error occurred while submitting the form.',
                    toast: true,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 1500
                });
            } finally {
                setIsLoading(false); // Hide loader
            }
        } else {
            // Error notification
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Please fix the errors in the form.',
                toast: true,
                timerProgressBar: true,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <Box sx={{ padding: 4, background: 'linear-gradient(to right, #f0f0e8, #e8e0d8)', minHeight: '100vh', color: '#333' }}>
            <ToastContainer autoClose={5000} />
            {isLoading && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <CircularProgress />
                </div>
            )}


            {/* User Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 3, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>User Information</Typography>

                <Grid container spacing={3}>
                    {/* User Details Section */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="UID"
                            variant="outlined"
                            color="primary"
                            value={userDetails?.uid || ''}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Faculty Name"
                            variant="outlined"
                            color="primary"
                            value={userDetails?.username || ''}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Department"
                            variant="outlined"
                            color="primary"
                            value={userDetails?.department || ''}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="region-label">Region</InputLabel>
                            <Select
                                labelId="region-label"
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                label="Region"
                            >
                                {regions.map((region) => (
                                    <MenuItem key={region.id} value={region.id}>
                                        {region.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="board-label">Board</InputLabel>
                            <Select
                                labelId="board-label"
                                value={selectedBoard}
                                onChange={handleBoardChange}
                                label="Board"
                            >
                                {boards.map((board) => (
                                    <MenuItem key={board.id} value={board.id}>
                                        {board.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* School Information Section */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="School Name"
                            variant="outlined"
                            color="primary"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="School Address"
                            variant="outlined"
                            color="primary"
                            value={schoolAddress}
                            onChange={(e) => setSchoolAddress(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            color="primary"
                            value={date}
                            onChange={(e) => setDate(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="No. of Students"
                            type="number"
                            variant="outlined"
                            color="primary"
                            value={noOfStudents}
                            onChange={(e) => setNoOfStudents(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Topic Covered"
                            variant="outlined"
                            color="primary"
                            value={topicCovered}
                            onChange={(e) => setTopicCovered(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Visit Remark"
                            variant="outlined"
                            color="primary"
                            value={visitRemark}
                            onChange={(e) => setVisitRemark(e.target.value)} // Bind state
                        />
                    </Grid>

                    {/* File Upload Section */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component="label"
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<UploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            Upload Document
                            <input type="file" onChange={handleChangeFiles} style={{ display: 'none' }} multiple />
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component="label"
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<UploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            Upload Images
                            <input type="file" onChange={handleChangeFiles} style={{ display: 'none' }} multiple />
                        </Button>
                    </Grid>
                </Grid>

                {/* Displaying Uploaded Files */}
                <Box mt={2}>
                    {files.map((file, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ flex: 1 }}>{file.name}</Typography>
                            <IconButton onClick={() => handleRemoveFile(index)} color="error">
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </Paper>


            {/* Principal Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Principal Information</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Principal Name"
                            variant="outlined"
                            color="primary"
                            value={principalName}
                            onChange={(e) => setPrincipalName(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Principal Contact No"
                            variant="outlined"
                            color="primary"
                            value={principalContactNo}
                            onChange={(e) => setPrincipalContactNo(e.target.value)} // Bind state
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="DOB"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            color="primary"
                            value={principalDob}
                            onChange={(e) => setPrincipalDob(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="DOA"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            color="primary"
                            value={principalDoa}
                            onChange={(e) => setPrincipalDoa(e.target.value)} // Bind state
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            variant="outlined"
                            color="primary"
                            value={principalEmail}
                            onChange={(e) => setPrincipalEmail(e.target.value)} // Bind state
                        />
                    </Grid>
                </Grid>

            </Paper>

            {/* Graduation Teacher Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Graduation Teacher Information</Typography>
                {graduationTeachers.map((teacher, index) => (
                    <Grid container spacing={3} key={teacher.id} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                color="primary"
                                value={teacher.name || ''}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].name = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                                error={Boolean(errors[`graduationName-${index}`])}
                                helperText={errors[`graduationName-${index}`]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Contact No"
                                variant="outlined"
                                color="primary"
                                value={teacher.contactNo || ''}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].contactNo = numericValue;
                                    setGraduationTeachers(newTeachers);
                                }}
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                }}
                                error={Boolean(errors[`graduationContactNo-${index}`])}
                                helperText={errors[`graduationContactNo-${index}`]}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="DOB"
                                type="date"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                color="primary"
                                value={teacher.dob}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].dob = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="DOA"
                                type="date"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                color="primary"
                                value={teacher.doa}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].doa = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Subject"
                                variant="outlined"
                                color="primary"
                                value={teacher.subject}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].subject = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                variant="outlined"
                                color="primary"
                                value={teacher.email}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].email = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <IconButton color="primary" onClick={handleAddGraduationTeacher}><AddCircle /></IconButton>
                        </Grid>
                        {index > 0 && (
                            <Grid item xs={12} sm={6} md={3}>
                                <IconButton color="error" onClick={() => handleRemoveGraduationTeacher(teacher.id)}><RemoveCircle /></IconButton>
                            </Grid>
                        )}
                    </Grid>
                ))}
            </Paper>

            {/* PGT Teacher Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>PGT Teacher Information</Typography>
                {pgtTeachers.map((teacher, index) => (
                    <Grid container spacing={3} key={teacher.id} sx={{ mt: 1 }}>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                color="primary"
                                value={teacher.name || ''}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].name = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Contact No"
                                variant="outlined"
                                color="primary"
                                value={teacher.contactNo || ''}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].contactNo = e.target.value.replace(/[^0-9]/g, ''); // Ensure numeric input
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="DOB"
                                type="date"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                color="primary"
                                value={teacher.dob}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].dob = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="DOA"
                                type="date"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                color="primary"
                                value={teacher.doa}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].doa = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Subject"
                                variant="outlined"
                                color="primary"
                                value={teacher.subject}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].subject = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                variant="outlined"
                                color="primary"
                                value={teacher.email}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].email = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <IconButton color="primary" onClick={handleAddPgtTeacher}><AddCircle /></IconButton>
                        </Grid>
                        {index > 0 && (
                            <Grid item xs={12} sm={6} md={3}>
                                <IconButton color="error" onClick={() => handleRemovePgtTeacher(teacher.id)}><RemoveCircle /></IconButton>
                            </Grid>
                        )}
                    </Grid>
                ))}
            </Paper>

            {/* Strength Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Strength Information</Typography>

                <Typography variant="h6" sx={{ mt: 2, color: '#333' }}>Strength in 12th</Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {['pcm', 'pcb', 'commerce', 'humanities', 'other'].map((field) => (
                        <Grid item xs={12} sm={6} md={2.4} key={`strength-in12-${field}`}>
                            <TextField
                                fullWidth
                                label={field.toUpperCase()}
                                variant="outlined"
                                color="primary"
                                type="number"
                                value={strengths[field].in12}
                                onChange={(e) => handleStrengthChange(field, 'in12', e.target.value)}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Typography variant="h6" sx={{ mt: 2, color: '#333' }}>Strength in Coaching/Tuition</Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {['pcm', 'pcb', 'commerce', 'humanities', 'other'].map((field) => (
                        <Grid item xs={12} sm={6} md={2.4} key={`strength-coaching-${field}`}>
                            <TextField
                                fullWidth
                                label={field.toUpperCase()}
                                variant="outlined"
                                color="primary"
                                type="number"
                                value={strengths[field].coaching}
                                onChange={(e) => handleStrengthChange(field, 'coaching', e.target.value)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button variant="contained" color="success" size="large" startIcon={<Save />} onClick={handleSubmit}>Submit</Button>
            </Box>
        </Box>
    );
};

export default DataForm;