import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../../utils/firebaseConfig'; // Import Firebase utils
import { Paper, Typography, Grid, Box, Button, Table, TableHead, TableBody, TableRow, TableCell, Collapse } from '@mui/material';

const ViewSubmissions = () => {
  const [user, loading, error] = useAuthState(auth); // Get authenticated user
  const [formList, setFormList] = useState([]); // Store list of data forms
  const [selectedFormId, setSelectedFormId] = useState(null); // Store selected form ID
  const [selectedFormData, setSelectedFormData] = useState(null); // Store the detailed data of the selected form
  const [openDetails, setOpenDetails] = useState(false); // Toggle details view

  // Fetch all forms for the authenticated user
  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return; // If user is not authenticated, don't proceed

      try {
        const formsRef = collection(firestore, `users/${user.uid}/dataForms`);
        const snapshot = await getDocs(formsRef);

        if (snapshot.empty) {
          console.log('No data forms found');
        } else {
          const forms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFormList(forms); // Set the form list to state
        }
      } catch (err) {
        console.error('Error fetching forms:', err);
      }
    };

    fetchForms();
  }, [user]);

  // Fetch data for the selected form
  const handleRowClick = async (formId) => {
    setSelectedFormId(formId);
    const docRef = doc(firestore, `users/${user.uid}/dataForms`, formId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setSelectedFormData(docSnap.data()); // Set the data to state
      setOpenDetails(true); // Open the details section
    } else {
      console.log('No such document!');
    }
  };

  // If still loading or if there's an error, show loading or error message
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // If no forms, show a message
  if (formList.length === 0) {
    return <div>No submission forms found</div>;
  }

  // Render the submission forms in a table
  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#ff8c00' }}>Submitted Data Forms</Typography>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {formList.map((form) => (
          <Box
            key={form.id}
            sx={{
              padding: 2,
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
            }}
            onClick={() => handleRowClick(form.id)}
          >
            <Typography variant="h6">{form.schoolName}</Typography>
            <Typography variant="body2">View {form.facultyName}</Typography>
          </Box>
        ))}
      </Box>

      {/* Display detailed information for selected form */}
      <Collapse in={openDetails}>
        <Box mt={2}>
          {selectedFormData && (
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#ff8c00' }}>Form Details</Typography>

              {/* Table to display the details */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Field</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* School Details */}
                  <TableRow>
                    <TableCell>School Name</TableCell>
                    <TableCell>{selectedFormData.schoolDetails.schoolName || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>{selectedFormData.schoolDetails.department || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>{selectedFormData.schoolDetails.date || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Topic Covered</TableCell>
                    <TableCell>{selectedFormData.schoolDetails.topicCovered || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Visit Remark</TableCell>
                    <TableCell>{selectedFormData.schoolDetails.visitRemark || 'N/A'}</TableCell>
                  </TableRow>

                  {/* Document URLs */}
                  {selectedFormData.documentUrls && selectedFormData.documentUrls.length > 0 ? (
                    <TableRow>
                      <TableCell>Documents</TableCell>
                      <TableCell>
                        {selectedFormData.documentUrls.map((url, index) => (
                          <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                            Document {index + 1}
                          </a>
                        ))}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell>No Documents</TableCell>
                      <TableCell>N/A</TableCell>
                    </TableRow>
                  )}

                  {/* Graduation Teachers */}
                  {selectedFormData.graduationTeachers && selectedFormData.graduationTeachers.length > 0 ? (
                    <TableRow>
                      <TableCell>Graduation Teachers</TableCell>
                      <TableCell>
                        {selectedFormData.graduationTeachers.map((teacher, index) => (
                          <div key={index}>
                            {teacher.name} ({teacher.contactNo})
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell>No Graduation Teachers</TableCell>
                      <TableCell>N/A</TableCell>
                    </TableRow>
                  )}

                  {/* Principal Information */}
                  {selectedFormData.principalInfo && (
                    <TableRow>
                      <TableCell>Principal</TableCell>
                      <TableCell>
                        {selectedFormData.principalInfo.name || 'N/A'} <br />
                        Contact: {selectedFormData.principalInfo.contactNo || 'N/A'} <br />
                        Email: {selectedFormData.principalInfo.email || 'N/A'}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* School Strengths */}
                  {selectedFormData.strengths && (
                    <TableRow>
                      <TableCell>Strengths</TableCell>
                      <TableCell>
                        {Object.entries(selectedFormData.strengths).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value.coaching || 'N/A'} - {value.in12 || 'N/A'}
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ViewSubmissions;
