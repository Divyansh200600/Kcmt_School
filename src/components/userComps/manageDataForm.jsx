import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth"; // For fetching authenticated user
import { getFirestore, collection, query, getDocs } from "firebase/firestore"; // Firestore functions
import Swal from 'sweetalert2';

const ManageUserDataForms = () => {
    const [formData, setFormData] = useState([]); // Store the form data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch data when component mounts
    useEffect(() => {
        const fetchFormData = async () => {
            try {
                // Fetch the currently authenticated user's UID
                const auth = getAuth();
                const user = auth.currentUser;

                // If the user is not authenticated, show an error message
                if (!user) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Authenticated',
                        text: 'Please log in to view your uploaded data.',
                    });
                    return;
                }

                // Get reference to Firestore
                const db = getFirestore();
                const q = query(collection(db, `users/${user.uid}/dataForm`)); // Get all dataForm documents for this user
                const querySnapshot = await getDocs(q);

                // Map the data to state
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setFormData(data); // Update state with fetched data
            } catch (err) {
                setError('Failed to load form data'); // Set error state if data fetch fails
                console.error(err);
            } finally {
                setLoading(false); // Set loading to false once data is fetched or if there's an error
            }
        };

        fetchFormData();
    }, []);

    // Handle loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Handle error state
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Your Uploaded Data Forms</h1>
            {formData.length === 0 ? (
                <p>No data found</p> // Display message if no data exists
            ) : (
                formData.map((form, index) => (
                    <div key={form.id} style={{ border: '1px solid #ddd', margin: '10px 0', padding: '10px' }}>
                        <h3>Form {index + 1}</h3>
                        
                        {/* Handle Graduation Teachers */}
                        <p><strong>Graduation Teachers:</strong> 
                            {Array.isArray(form.graduationTeachers) 
                                ? form.graduationTeachers.map(t => t.name).join(', ') 
                                : 'No graduation teachers available'}
                        </p>

                        {/* Handle PGT Teachers */}
                        <p><strong>PGT Teachers:</strong> 
                            {Array.isArray(form.pgtTeachers) 
                                ? form.pgtTeachers.map(t => t.name).join(', ') 
                                : 'No PGT teachers available'}
                        </p>

                        {/* Handle Board */}
                        <p><strong>Board:</strong> {form.board || 'No board specified'}</p>

                        {/* Handle Region */}
                        <p><strong>Region:</strong> {form.region || 'No region specified'}</p>

                        {/* Handle Strengths */}
                        <p><strong>Strengths:</strong> {form.strengths || 'No strengths provided'}</p>

                        {/* Handle Files */}
                        <div>
                            <strong>Files:</strong>
                            <ul>
                                {form.files && form.files.length > 0 ? (
                                    form.files.map((fileUrl, idx) => (
                                        <li key={idx}>
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                View File {idx + 1}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li>No files uploaded</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ManageUserDataForms;
