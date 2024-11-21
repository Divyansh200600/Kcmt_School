import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Grid, Box, Button, Typography, IconButton, Paper } from '@mui/material';
import { AddCircle, RemoveCircle, Save, Upload as UploadIcon } from '@mui/icons-material';
import { auth, firestore, storage } from '../../utils/firebaseConfig'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, getDocs,collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2';
import { getAuth } from "firebase/auth";  

const DataForm = () => {
    const [graduationTeachers, setGraduationTeachers] = useState([{ id: Date.now() }]);
    const [pgtTeachers, setPgtTeachers] = useState([{ id: Date.now() }]);
    const [userDetails, setUserDetails] = useState(null); 
    const [errors, setErrors] = useState({});
    const [strengths, setStrengths] = useState({
        pcm: { in12: '', coaching: '' },
        pcb: { in12: '', coaching: '' },
        commerce: { in12: '', coaching: '' },
        humanities: { in12: '', coaching: '' },
        other: { in12: '', coaching: '' }
    });
    const [board, setBoard] = useState('');
    const [regions, setRegions] = useState([]);
    const [region, setRegion] = useState('');
    const [files, setFiles] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);

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
        const fetchRegions = async () => {
            try {
                // Correct way to fetch data with Firebase v9 or later
                const regionsSnapshot = await getDocs(collection(firestore, 'locations'));
                const regionsList = regionsSnapshot.docs.map(doc => ({
                    id: doc.id, // Document ID
                    name: doc.data().name // The actual data for each region
                }));
                setRegions(regionsList);
            } catch (error) {
                console.error("Error fetching regions: ", error);
            }
        };
        fetchRegions();
    }, []);

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

    const handleFileChange = (e) => {
        setFiles([...files, ...Array.from(e.target.files)]);
    };

    const uploadFiles = async () => {
        const urls = [];
        // Fetch the authenticated user's UID from Firebase Auth
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            console.log("No user is authenticated");
            return;
        }
    
        for (let file of files) {
            const fileRef = ref(storage, `users/${user.uid}/images-and-docs/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);
            urls.push(fileUrl);
        }
        setFileUrls(urls);  // This will store the file URLs
    };
    
    const handleSubmit = async () => {
        // Fetch the authenticated user's UID from Firebase Auth
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            console.log("No user is authenticated");
            return;
        }
    
        if (validateForm()) {
            Swal.fire({
                title: 'Uploading',
                text: 'Please wait while we upload your data',
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
    
            try {
                await uploadFiles(); // Upload files first
    
                // Create a unique ID for the dataForm document
                const dataFormId = doc(collection(firestore, `users/${user.uid}/dataForm`)).id;
    
                // Reference to the user's dataForm collection
                const dataFormRef = doc(firestore, `users/${user.uid}/dataForm/${dataFormId}`);
    
                // Saving the form data along with the file URLs
                await setDoc(dataFormRef, {
                    graduationTeachers, 
                    pgtTeachers, 
                    board, 
                    region, 
                    strengths, 
                    files: fileUrls,  // These are the URLs of the uploaded files
                    timestamp: new Date().toISOString()  // Optionally, store the timestamp for the submission
                });
    
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Data uploaded successfully',
                    timer: 1500,
                    position: 'top-end'
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred during the upload',
                    timer: 1500,
                    position: 'top-end'
                });
            }
        } else {
            console.log("Form has errors");
        }
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

    return (
        <Box sx={{ padding: 4, background: 'linear-gradient(to right, #f0f0e8, #e8e0d8)', minHeight: '100vh', color: '#333' }}>
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 3, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>User Information</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="UID" variant="outlined" value={userDetails?.uid || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Faculty Name" variant="outlined" value={userDetails?.username || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Department" variant="outlined" value={userDetails?.department || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Select fullWidth value={region} onChange={(e) => setRegion(e.target.value)} displayEmpty>
                            <MenuItem value="" disabled>Select Region</MenuItem>
                            {regions.map(r => (
                                <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="School Name" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="School Address" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Select fullWidth value={board} onChange={(e) => setBoard(e.target.value)} displayEmpty>
                            <MenuItem value="" disabled>Select Board</MenuItem>
                            <MenuItem value="UP Board">UP Board</MenuItem>
                            <MenuItem value="CBSE">CBSE</MenuItem>
                            <MenuItem value="ICSE">ICSE</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="No. of Students" type="number" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Topic Covered" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Visit Remark" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            onChange={handleFileChange}
                            id="files"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="files">
                            <Button variant="contained" color="primary" fullWidth component="span" startIcon={<UploadIcon />}>Upload</Button>
                        </label>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Principal Information</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Principal Name" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Principal Contact No" variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOB" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOA" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Email" type="email" variant="outlined" /></Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Graduation Teacher Information</Typography>
                {graduationTeachers.map((teacher, index) => (
                    <Grid container spacing={3} key={teacher.id} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
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
                                value={teacher.contactNo || ''}
                                onChange={(e) => {
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].contactNo = e.target.value;
                                    setGraduationTeachers(newTeachers);
                                }}
                                error={Boolean(errors[`graduationContactNo-${index}`])}
                                helperText={errors[`graduationContactNo-${index}`]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOB" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOA" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Subject" variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Email" type="email" variant="outlined" /></Grid>
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

            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>PGT Teacher Information</Typography>
                {pgtTeachers.map((teacher, index) => (
                    <Grid container spacing={3} key={teacher.id} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                value={teacher.name || ''}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].name = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                                error={Boolean(errors[`pgtName-${index}`])}
                                helperText={errors[`pgtName-${index}`]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Contact No"
                                variant="outlined"
                                value={teacher.contactNo || ''}
                                onChange={(e) => {
                                    const newTeachers = [...pgtTeachers];
                                    newTeachers[index].contactNo = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                                error={Boolean(errors[`pgtContactNo-${index}`])}
                                helperText={errors[`pgtContactNo-${index}`]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOB" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOA" type="date" variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Subject" variant="outlined" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Email" type="email" variant="outlined" /></Grid>
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