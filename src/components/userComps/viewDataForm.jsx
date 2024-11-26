import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { firestore } from '../../utils/firebaseConfig';
import { CircularProgress, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Grid, Divider, Paper, Button, Tab, Tabs, Box, List, ListItem, ListItemText } from '@mui/material';
import Swal from 'sweetalert2';
import { School, Person, Group, Layers, Description, Download } from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewDataForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataForms, setDataForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [tabIndex, setTabIndex] = useState(0); // For tabs
    const [regionNames, setRegionNames] = useState({});
    const [boardNames, setBoardNames] = useState({});
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    // Fetch regions and boards names from Firestore
    const fetchRegionAndBoardNames = async () => {
        try {
            const regionCollectionRef = collection(firestore, 'locations');
            const boardCollectionRef = collection(firestore, 'levels_and_boards');

            // Fetch all regions
            const regionSnapshot = await getDocs(regionCollectionRef);
            const regionMap = {};
            regionSnapshot.forEach(doc => {
                regionMap[doc.id] = doc.data().name;
            });
            setRegionNames(regionMap);

            // Fetch all boards
            const boardSnapshot = await getDocs(boardCollectionRef);
            const boardMap = {};
            boardSnapshot.forEach(doc => {
                boardMap[doc.id] = doc.data().name;
            });
            setBoardNames(boardMap);
        } catch (error) {
            console.error("Error fetching regions and boards:", error);
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'An error occurred while fetching regions and boards.',
                toast: true,
                timerProgressBar: true,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    // Fetch all data forms
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
        fetchRegionAndBoardNames();
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

    const downloadPDF = async () => {
        if (!selectedForm) return;
    
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4',
        });
    
        try {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
    
            // Title Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text(`Form Details - ${selectedForm.schoolDetails?.schoolName}`, margin, 30);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Date: ${selectedForm.schoolDetails?.date}`, margin, 50);
    
            let currentY = 70; // Start point for the content
    
            // School Info Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('School Info:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(`School Name: ${selectedForm.schoolDetails?.schoolName || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Address: ${selectedForm.schoolDetails?.schoolAddress || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Region: ${regionNames[selectedForm.selectedRegion] || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Board: ${boardNames[selectedForm.selectedBoard] || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Number of Students: ${selectedForm.schoolDetails?.noOfStudents || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Topic Covered: ${selectedForm.schoolDetails?.topicCovered || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Visit Remark: ${selectedForm.schoolDetails?.visitRemark || 'N/A'}`, margin, currentY);
            currentY += 20;
    
            // Principal Info Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Principal Info:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(`Name: ${selectedForm.principalInfo?.name || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Contact No: ${selectedForm.principalInfo?.contactNo || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`DOB: ${selectedForm.principalInfo?.dob || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`DOA: ${selectedForm.principalInfo?.doa || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`Email: ${selectedForm.principalInfo?.email || 'N/A'}`, margin, currentY);
            currentY += 20;
    
            // Teachers Info Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Teachers Info:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'bold');
            pdf.text('Graduation Teachers:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            selectedForm.graduationTeachers?.forEach((teacher, index) => {
                pdf.text(`${index + 1}. Name: ${teacher.name || 'N/A'}, Subject: ${teacher.subject || 'N/A'}`, margin, currentY);
                currentY += 10;
                pdf.text(`   Contact: ${teacher.contactNo || 'N/A'}, DOB: ${teacher.dob || 'N/A'}, DOA: ${teacher.doa || 'N/A'}, Email: ${teacher.email || 'N/A'}`, margin, currentY);
                currentY += 10;
            });
    
            currentY += 10;
            pdf.setFont('helvetica', 'bold');
            pdf.text('PGT Teachers:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            selectedForm.pgtTeachers?.forEach((teacher, index) => {
                pdf.text(`${index + 1}. Name: ${teacher.name || 'N/A'}, Subject: ${teacher.subject || 'N/A'}`, margin, currentY);
                currentY += 10;
                pdf.text(`   Contact: ${teacher.contactNo || 'N/A'}, DOB: ${teacher.dob || 'N/A'}, DOA: ${teacher.doa || 'N/A'}, Email: ${teacher.email || 'N/A'}`, margin, currentY);
                currentY += 10;
            });
    
            currentY += 20;
    
            // Strengths Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Strengths:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Commerce (12th): ${selectedForm.strengths?.commerce?.in12 || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`PCM (12th): ${selectedForm.strengths?.pcm?.in12 || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`PCB (12th): ${selectedForm.strengths?.pcb?.in12 || 'N/A'}`, margin, currentY);
            currentY += 10;
    
            pdf.text(`Commerce (Coaching): ${selectedForm.strengths?.commerce?.coaching || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`PCM (Coaching): ${selectedForm.strengths?.pcm?.coaching || 'N/A'}`, margin, currentY);
            currentY += 10;
            pdf.text(`PCB (Coaching): ${selectedForm.strengths?.pcb?.coaching || 'N/A'}`, margin, currentY);
            currentY += 20;
    
            // Documents Section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text('Documents:', margin, currentY);
            currentY += 10;
    
            pdf.setFont('helvetica', 'normal');
            selectedForm.documentUrls?.forEach((url, index) => {
                pdf.text(`${index + 1}. ${url}`, margin, currentY);
                currentY += 10;
    
                if (currentY > 750) { // Prevent overflow
                    pdf.addPage();
                    currentY = margin;
                }
            });
    
            pdf.save(`Form_${selectedForm.id}_Details.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while generating the PDF. Please try again.',
            });
        }
    };
    
    



    if (isLoading) {
        return (
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>All Data Forms</Typography>
            <Grid container spacing={3}>
                {dataForms.length > 0 ? (
                    dataForms.map((form, index) => (
                        <Grid item xs={12} sm={6} md={4} key={form.id}>
                            <Card
                                style={{
                                    cursor: 'pointer',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.3s ease',
                                }}
                                onClick={() => handleCardClick(form)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <CardContent>
                                    <Typography variant="h6" style={{ marginBottom: '10px', color: '#1976d2' }}>Form {index + 1}</Typography>
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
                <DialogTitle style={{ backgroundColor: '#1976d2', color: 'white' }}>Form Details</DialogTitle>
                <DialogContent style={{ backgroundColor: '#f5f5f5' }} id="formDetailsContent">
                    {selectedForm && (
                        <Box>
                            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                                <Tab label="School Info" icon={<School />} />
                                <Tab label="Principal Info" icon={<Person />} />
                                <Tab label="Teachers Info" icon={<Group />} />
                                <Tab label="Strengths" icon={<Layers />} />
                                <Tab label="Documents" icon={<Description />} />
                            </Tabs>

                            {/* Tab Content */}
                            <Box style={{ marginTop: '20px' }}>
                                {tabIndex === 0 && (
                                    <div id="schoolInfoContent">
                                        <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
                                            <Typography variant="h6">School Info</Typography>
                                            <Divider style={{ marginBottom: '10px' }} />
                                            <p><strong>School Name:</strong> {selectedForm.schoolDetails?.schoolName}</p>
                                            <p><strong>School Address:</strong> {selectedForm.schoolDetails?.schoolAddress}</p>
                                            <Typography variant="body2"><strong>Region:</strong> {regionNames[selectedForm.selectedRegion] || 'N/A'}</Typography>
                                            <Typography variant="body2"><strong>Board:</strong> {boardNames[selectedForm.selectedBoard] || 'N/A'}</Typography>
                                            <p><strong>Date:</strong> {selectedForm.schoolDetails?.date}</p>
                                            <p><strong>No. of Students:</strong> {selectedForm.schoolDetails?.noOfStudents}</p>
                                            <p><strong>Topic Covered:</strong> {selectedForm.schoolDetails?.topicCovered}</p>
                                            <p><strong>Visit Remark:</strong> {selectedForm.schoolDetails?.visitRemark}</p>
                                        </Paper>
                                    </div>
                                )}


                                {tabIndex === 1 && (
                                    <div id="principalInfoContent">
                                        <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
                                            <Typography variant="h6">Principal Info</Typography>
                                            <Divider style={{ marginBottom: '10px' }} />
                                            <p><strong>Name:</strong> {selectedForm.principalInfo?.name}</p>
                                            <p><strong>Contact No:</strong> {selectedForm.principalInfo?.contactNo}</p>
                                            <p><strong>DOB:</strong> {selectedForm.principalInfo?.dob}</p>
                                            <p><strong>DOA:</strong> {selectedForm.principalInfo?.doa}</p>
                                            <p><strong>Email:</strong> {selectedForm.principalInfo?.email}</p>
                                        </Paper>
                                    </div>
                                )}


                                {tabIndex === 2 && (
                                    <div id="teachersInfoContent">
                                        <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
                                            <Typography variant="h6">Teachers Info</Typography>
                                            <Divider style={{ marginBottom: '10px' }} />
                                            <Typography variant="subtitle1">Graduation Teachers</Typography>
                                            <List>
                                                {selectedForm.graduationTeachers?.map((teacher, index) => (
                                                    <ListItem key={teacher.id}>
                                                        <ListItemText
                                                            primary={<strong>{teacher.name}</strong>}
                                                            secondary={`${teacher.subject} - ${teacher.contactNo} - DOB: ${teacher.dob} - DOA: ${teacher.doa} - Email: ${teacher.email}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>

                                            <Typography variant="subtitle1" style={{ marginTop: '20px' }}>PGT Teachers</Typography>
                                            <List>
                                                {selectedForm.pgtTeachers?.map((teacher, index) => (
                                                    <ListItem key={teacher.id}>
                                                        <ListItemText
                                                            primary={<strong>{teacher.name}</strong>}
                                                            secondary={`${teacher.subject} - ${teacher.contactNo} - DOB: ${teacher.dob} - DOA: ${teacher.doa} - Email: ${teacher.email}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </div>
                                )}


                                {tabIndex === 3 && (
                                    <div id="strengthsContent">
                                        <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
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
                                    </div>
                                )}


                                {tabIndex === 4 && (
                                    <div id="documentsContent">
                                        <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
                                            <Typography variant="h6">Documents</Typography>
                                            <Divider style={{ marginBottom: '10px' }} />
                                            <List>
                                                {selectedForm.documentUrls?.map((url, i) => (
                                                    <ListItem key={i}>
                                                        <ListItemText
                                                            primary={<a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>View Document {i + 1}</a>}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </div>
                                )}

                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px' }}>
                    <Button onClick={downloadPDF} color="primary" variant="contained" startIcon={<Download />} style={{ backgroundColor: '#1976d2' }}>Download PDF</Button>
                    <Button onClick={handleCloseModal} color="secondary" variant="contained">Close</Button>
                </div>
            </Dialog>
        </div>
    );
};

export default ViewDataForm;
