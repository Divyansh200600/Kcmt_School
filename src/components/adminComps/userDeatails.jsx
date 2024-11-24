import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../utils/firebaseConfig";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemText,

  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Box,
  Paper,
  Button,
} from "@mui/material";
import { FaFilePdf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { School, Person, Group, Layers, Description } from "@mui/icons-material";

import Swal from 'sweetalert2';

export default function UserDetails() {
  const { uid } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [dataForms, setDataForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [regionNames, setRegionNames] = useState({});
    const [boardNames, setBoardNames] = useState({});

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


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details
        const userDoc = doc(firestore, "users", uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUserDetails(userSnapshot.data());
        } else {
          console.error("User not found");
        }

        // Fetch user data forms
        const dataFormsCollection = collection(firestore, `users/${uid}/dataForms`);
        const formsSnapshot = await getDocs(dataFormsCollection);
        if (!formsSnapshot.empty) {
          const forms = formsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDataForms(forms);
        }
      } catch (error) {
        console.error("Error fetching user data or forms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchRegionAndBoardNames();
  }, [uid]);

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
  const generatePDF = (form) => {
    const doc = new jsPDF();

    // Set fonts for modern look
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(20);

    // Title of the document
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(40, 53, 147); // Blue color for title
    doc.text("User Form Details", 20, 20);

    let yPosition = 30; // Start from position 30 for content

    // School Info Section
    doc.setTextColor(0, 0, 0); // Reset text color
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("School Information", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`School Name: ${form.schoolDetails?.schoolName || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Address: ${form.schoolDetails?.schoolAddress || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Region: ${form.selectedRegion || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Board: ${form.selectedBoard || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${form.schoolDetails?.date || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`No. of Students: ${form.schoolDetails?.noOfStudents || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Topic Covered: ${form.schoolDetails?.topicCovered || "N/A"}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Visit Remark: ${form.schoolDetails?.visitRemark || "N/A"}`, 20, yPosition);
    yPosition += 10; // Add extra space after this section

    // Principal Info Section
    if (form.principalInfo) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 128, 0); // Green color for principal section
      doc.text("Principal Information", 20, yPosition);
      yPosition += 10;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset color
      doc.text(`Name: ${form.principalInfo.name || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Contact No: ${form.principalInfo.contactNo || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`DOB: ${form.principalInfo.dob || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`DOA: ${form.principalInfo.doa || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Email: ${form.principalInfo.email || "N/A"}`, 20, yPosition);
      yPosition += 20; // Add extra space after principal info
    }

    // Strengths Section
    if (form.strengths) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 153, 255); // Light blue for strengths
      doc.text("Strengths", 20, yPosition);
      yPosition += 10;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset color

      // In 12th Strengths
      doc.text("In 12th:", 20, yPosition);
      yPosition += 10;
      doc.text(`Commerce: ${form.strengths?.commerce?.in12 || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`PCM: ${form.strengths?.pcm?.in12 || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`PCB: ${form.strengths?.pcb?.in12 || "N/A"}`, 20, yPosition);
      yPosition += 10;

      // Coaching Strengths
      doc.text("Coaching:", 20, yPosition);
      yPosition += 10;
      doc.text(`Commerce: ${form.strengths?.commerce?.coaching || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`PCM: ${form.strengths?.pcm?.coaching || "N/A"}`, 20, yPosition);
      yPosition += 10;
      doc.text(`PCB: ${form.strengths?.pcb?.coaching || "N/A"}`, 20, yPosition);
      yPosition += 20; // Add extra space after strengths
    }

    // Teachers Info - Add table for teachers
    if (form.graduationTeachers || form.pgtTeachers) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 69, 0); // Red-orange for teachers section
      doc.text("Teachers Information", 20, yPosition);
      yPosition += 10;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset color

      // Graduation Teachers
      if (form.graduationTeachers) {
        doc.text("Graduation Teachers:", 20, yPosition);
        yPosition += 10;
        form.graduationTeachers.forEach((teacher, index) => {
          doc.text(`${index + 1}. ${teacher.name} (${teacher.subject})`, 20, yPosition);
          doc.text(`Contact: ${teacher.contactNo} | Email: ${teacher.email}`, 20, yPosition + 10);
          yPosition += 20; // Increase space for next teacher
        });
      }

      // PGT Teachers
      if (form.pgtTeachers) {
        doc.text("PGT Teachers:", 20, yPosition);
        yPosition += 10;
        form.pgtTeachers.forEach((teacher, index) => {
          doc.text(`${index + 1}. ${teacher.name} (${teacher.subject})`, 20, yPosition);
          doc.text(`Contact: ${teacher.contactNo} | Email: ${teacher.email}`, 20, yPosition + 10);
          yPosition += 20;
        });
      }
    }

    // Save the PDF with a modernized file name
    const filename = `${form.schoolDetails?.schoolName || "Form"}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={80} thickness={4.5} />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      <Typography variant="h3" style={{ fontWeight: "bold", marginBottom: "20px" }}>
        User Details
      </Typography>
      {userDetails && (
        <Paper elevation={3} style={{ padding: "20px", marginBottom: "30px" }}>
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            {userDetails.username}
          </Typography>
          <Typography variant="body1">Email: {userDetails.email}</Typography>
          <Typography variant="body1">Department: {userDetails.department}</Typography>
          <Typography variant="body1">Role: {userDetails.role}</Typography>
        </Paper>
      )}

      <Typography variant="h4" style={{ fontWeight: "bold", marginBottom: "20px" }}>
        User Data Forms
      </Typography>
      <Grid container spacing={4}>
        {dataForms.map((form, index) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(form)}
            >
              <CardContent>
                <Typography variant="h6" style={{ fontWeight: "bold", color: "#1976d2", marginBottom: "10px" }}>
                  Form {index + 1}
                </Typography>
                <Typography variant="body1">
                  <strong>School Name:</strong> {form.schoolDetails?.schoolName}
                </Typography>
                <Typography variant="body2">
                  <strong>Principal:</strong> {form.principalInfo?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {form.schoolDetails?.date}
                </Typography>
                <Button
                  startIcon={<FaFilePdf />}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#ff5722",
                    color: "white",
                    textTransform: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePDF(form);
                  }}
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedForm} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle style={{ backgroundColor: "#1976d2", color: "white" }}>Form Details</DialogTitle>
        <DialogContent>
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
                )}

                {tabIndex === 1 && (
                  <Paper style={{ padding: '16px', backgroundColor: '#ffffff' }}>
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
                )}

                {tabIndex === 3 && (
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
                )}

                {tabIndex === 4 && (
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
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
