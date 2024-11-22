import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { firestore } from '../../utils/firebaseConfig';
import { CircularProgress, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Grid, Divider, Paper, Button, Tab, Tabs, Box } from '@mui/material';
import Swal from 'sweetalert2';

const FetchAllDetailsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataForms, setDataForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null); // For handling popup details
    const [tabIndex, setTabIndex] = useState(0); // For tabs
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!userId) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'User not logged in.',
                    toast: true,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            setIsLoading(true);

            try {
                const dataFormsCollectionRef = collection(firestore, `users/${userId}/dataForms`);
                const querySnapshot = await getDocs(dataFormsCollectionRef);

                if (!querySnapshot.empty) {
                    const allDataForms = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setDataForms(allDataForms);
                } else {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'info',
                        title: 'No data forms found.',
                        toast: true,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            } catch (error) {
                console.error("Error fetching data forms:", error);
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'An error occurred while fetching data forms.',
                    toast: true,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 1500
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDetails();
    }, [userId]);

    const handleCardClick = (form) => {
        setSelectedForm(form);
    };

    const handleCloseModal = () => {
        setSelectedForm(null);
        setTabIndex(0);
    };

    const handleTabChange = (_, newValue) => {
        setTabIndex(newValue);
    };

    if (isLoading) {
        return (
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" style={{ marginBottom: '20px' }}>All Data Forms</Typography>
            <Grid container spacing={3}>
                {dataForms.length > 0 ? (
                    dataForms.map((form, index) => (
                        <Grid item xs={12} sm={6} md={4} key={form.id}>
                            <Card style={{ cursor: 'pointer', borderRadius: '8px' }} onClick={() => handleCardClick(form)}>
                                <CardContent>
                                    <Typography variant="h6" style={{ marginBottom: '10px' }}>Form {index + 1}</Typography>
                                    <Typography variant="body1"><strong>School Name:</strong> {form.schoolDetails?.schoolName}</Typography>
                                    <Typography variant="body2"><strong>Principal:</strong> {form.principalInfo?.name}</Typography>
                                    <Typography variant="body2"><strong>Date:</strong> {form.schoolDetails?.date}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">No data forms available.</Typography>
                )}
            </Grid>

            {/* Modal for detailed view */}
            <Dialog open={!!selectedForm} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>Form Details</DialogTitle>
                <DialogContent>
                    {selectedForm && (
                        <Box>
                            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                                <Tab label="School Info" />
                                <Tab label="Principal Info" />
                                <Tab label="Teachers Info" />
                                <Tab label="Strengths" />
                                <Tab label="Documents" />
                            </Tabs>

                            {/* Tab Content */}
                            <Box style={{ marginTop: '20px' }}>
                                {tabIndex === 0 && (
                                    <Paper style={{ padding: '16px' }}>
                                        <Typography variant="h6">School Info</Typography>
                                        <Divider style={{ marginBottom: '10px' }} />
                                        <p><strong>School Name:</strong> {selectedForm.schoolDetails?.schoolName}</p>
                                        <p><strong>School Address:</strong> {selectedForm.schoolDetails?.schoolAddress}</p>
                                        <p><strong>Region:</strong> {selectedForm.selectedRegion}</p>
                                        <p><strong>Board:</strong> {selectedForm.selectedBoard}</p>
                                        <p><strong>Date:</strong> {selectedForm.schoolDetails?.date}</p>
                                        <p><strong>No. of Students:</strong> {selectedForm.schoolDetails?.noOfStudents}</p>
                                        <p><strong>Topic Covered:</strong> {selectedForm.schoolDetails?.topicCovered}</p>
                                        <p><strong>Visit Remark:</strong> {selectedForm.schoolDetails?.visitRemark}</p>
                                    </Paper>
                                )}

                                {tabIndex === 1 && (
                                    <Paper style={{ padding: '16px' }}>
                                        <Typography variant="h6">Principal Info</Typography>
                                        <Divider style={{ marginBottom: '10px' }} />
                                        <p><strong>Name:</strong> {selectedForm.principalInfo?.name}</p>
                                        <p><strong>Contact No:</strong> {selectedForm.principalInfo?.contactNo}</p>
                                        <p><strong>DOB:</strong> {selectedForm.principalInfo?.dob}</p>
                                        <p><strong>DOA:</strong> {selectedForm.principalInfo?.doa}</p>
                                        <p><strong>Email:</strong> {selectedForm.principalInfo?.email}</p>
                                    </Paper>
                                )}

                                {tabIndex === 2 && (
                                    <Paper style={{ padding: '16px' }}>
                                        <Typography variant="h6">Teachers Info</Typography>
                                        <Divider style={{ marginBottom: '10px' }} />
                                        <Typography variant="subtitle1">Graduation Teachers</Typography>
                                        {selectedForm.graduationTeachers?.map((teacher, index) => (
                                            <p key={teacher.id}>
                                                <strong>{index + 1}:</strong> {teacher.name}, {teacher.contactNo}
                                            </p>
                                        ))}
                                        <Typography variant="subtitle1" style={{ marginTop: '10px' }}>PGT Teachers</Typography>
                                        {selectedForm.pgtTeachers?.map((teacher, index) => (
                                            <p key={teacher.id}>
                                                <strong>{index + 1}:</strong> {teacher.name}, {teacher.contactNo}
                                            </p>
                                        ))}
                                    </Paper>
                                )}

                                {tabIndex === 3 && (
                                    <Paper style={{ padding: '16px' }}>
                                        <Typography variant="h6">Strengths</Typography>
                                        <Divider style={{ marginBottom: '10px' }} />
                                        <Typography variant="subtitle1">In 12th</Typography>
                                        <p><strong>Commerce:</strong> {selectedForm.strengths?.commerce?.in12 || 'N/A'}</p>
                                        <p><strong>PCM:</strong> {selectedForm.strengths?.pcm?.in12 || 'N/A'}</p>
                                        <p><strong>PCB:</strong> {selectedForm.strengths?.pcb?.in12 || 'N/A'}</p>

                                        <Typography variant="subtitle1" style={{ marginTop: '10px' }}>Coaching</Typography>
                                        <p><strong>Commerce:</strong> {selectedForm.strengths?.commerce?.coaching || 'N/A'}</p>
                                        <p><strong>PCM:</strong> {selectedForm.strengths?.pcm?.coaching || 'N/A'}</p>
                                        <p><strong>PCB:</strong> {selectedForm.strengths?.pcb?.coaching || 'N/A'}</p>
                                    </Paper>
                                )}

                                {tabIndex === 4 && (
                                    <Paper style={{ padding: '16px' }}>
                                        <Typography variant="h6">Documents</Typography>
                                        <Divider style={{ marginBottom: '10px' }} />
                                        {selectedForm.documentUrls?.map((url, i) => (
                                            <p key={i}>
                                                <a href={url} target="_blank" rel="noopener noreferrer">View Document {i + 1}</a>
                                            </p>
                                        ))}
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <Button onClick={handleCloseModal} color="primary">Close</Button>
            </Dialog>
        </div>
    );
};

export default FetchAllDetailsPage;
