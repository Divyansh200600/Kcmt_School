import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../../../utils/firebaseConfig';

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);  // Total user count
  const [totalAdmins, setTotalAdmins] = useState(0);  // Total admin count
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  // Set loading to true before fetching data
        const db = getFirestore(app);  // Get Firestore instance
        const usersRef = collection(db, 'users');  // Reference to 'users' collection

        // Query all users with role 'user' and 'admin'
        const userQuery = query(usersRef, where('role', '==', 'user'));
        const adminQuery = query(usersRef, where('role', '==', 'admin'));

        // Fetch users and admins separately
        const userSnapshot = await getDocs(userQuery);
        const adminSnapshot = await getDocs(adminQuery);

        setTotalUsers(userSnapshot.size);  // Count of users
        setTotalAdmins(adminSnapshot.size);  // Count of admins
      } catch (error) {
        console.error('Error fetching data:', error);  // Log the error
        setError('Error fetching data: ' + error.message);  // Set error state
      } finally {
        setLoading(false);  // Set loading to false once the data is fetched
      }
    };

    fetchData();  // Fetch data when the component mounts
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );  // Show loading state while data is being fetched
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );  // Show error message if fetching fails
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-gray-700">Total Users</h3>
            <p className="text-4xl font-bold text-blue-600">{totalUsers}</p>
          </div>

          {/* Total Admins Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-gray-700">Total Admins</h3>
            <p className="text-4xl font-bold text-green-600">{totalAdmins}</p>
          </div>

          {/* Additional Card (Optional, add more features here) */}
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-gray-700">Additional Stats</h3>
            <p className="text-4xl font-bold text-yellow-600">Coming Soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
