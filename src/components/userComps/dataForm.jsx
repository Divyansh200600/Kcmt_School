import React, { useState,useEffect } from 'react';
import { TextField, Grid, Box, Button, Typography, IconButton, Paper } from '@mui/material';
import { AddCircle, RemoveCircle, Save, Upload as UploadIcon } from '@mui/icons-material';
import { auth, firestore } from '../../utils/firebaseConfig'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Cbse = () => {
    const [graduationTeachers, setGraduationTeachers] = useState([{ id: Date.now() }]);
    const [pgtTeachers, setPgtTeachers] = useState([{ id: Date.now() }]);
    const [userDetails, setUserDetails] = useState(null); 

    // State for form validation
    const [errors, setErrors] = useState({});

    const [strengths, setStrengths] = useState({
        pcm: { in12: '', coaching: '' },
        pcb: { in12: '', coaching: '' },
        commerce: { in12: '', coaching: '' },
        humanities: { in12: '', coaching: '' },
        other: { in12: '', coaching: '' }
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // If the user is authenticated, fetch user details from Firestore using UID
                const userDocRef = doc(firestore, "users", user.uid);  // Adjust path as per your Firestore structure
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserDetails(userDocSnap.data()); // Set user details
                } else {
                    console.log("No user document found in Firestore!");
                }
            } else {
                setUserDetails(null); // Reset if user is not authenticated
            }
        });
        return () => unsubscribe(); // Clean up the subscription
    }, []);
    
    // Helper function for validating form
    const validateForm = () => {
        const newErrors = {};
        // Check if required fields are filled
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

    const handleSubmit = () => {
        if (validateForm()) {
            // Proceed with submission
            console.log("Form submitted successfully");
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
            
            {/* User Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 3, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>User Information</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="UID" variant="outlined" color="primary" value={userDetails?.uid || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Faculty Name" variant="outlined" color="primary" value={userDetails?.username || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Department" variant="outlined" color="primary" value={userDetails?.department || ''} disabled /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Region" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="School Name" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="School Address" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Board" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="No. of Students" type="number" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Topic Covered" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Visit Remark" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button variant="contained" color="primary" fullWidth startIcon={<UploadIcon />}>Upload Document</Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button variant="contained" color="primary" fullWidth startIcon={<UploadIcon />}>Upload Images</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Principal Information Section */}
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 4, background: '#fff', color: '#333' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Principal Information</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Principal Name" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Principal Contact No" variant="outlined" color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOB" type="date" variant="outlined" InputLabelProps={{ shrink: true }} color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="DOA" type="date" variant="outlined" InputLabelProps={{ shrink: true }} color="primary" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Email" type="email" variant="outlined" color="primary" /></Grid>
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
                                    const newTeachers = [...graduationTeachers];
                                    newTeachers[index].contactNo = e.target.value;
                                    setGraduationTeachers(newTeachers);
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Subject" variant="outlined" color="primary" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Email" type="email" variant="outlined" color="primary" />
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
                                error={Boolean(errors[`pgtName-${index}`])}
                                helperText={errors[`pgtName-${index}`]}
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
                                    newTeachers[index].contactNo = e.target.value;
                                    setPgtTeachers(newTeachers);
                                }}
                                error={Boolean(errors[`pgtContactNo-${index}`])}
                                helperText={errors[`pgtContactNo-${index}`]}
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Subject" variant="outlined" color="primary" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Email" type="email" variant="outlined" color="primary" />
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
                
                {/* Strength in 12th Row */}
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

                {/* Strength in Coaching/Tuition Row */}
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


            {/* Submit Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button variant="contained" color="success" size="large" startIcon={<Save />} onClick={handleSubmit}>Submit</Button>
            </Box>
        </Box>
    );
};

export default Cbse;
