import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';

import AdminLogin from './pages/adminPage/adminLogin';
import AdminDashboard from './pages/adminPage/adminDashboard';
import UserDashboard from './pages/userPage/userDb';
import LoginPage from './pages/adminPage/adminLogin';
import SubAdmin from './pages/subAdmin/subAdmin';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/SIS-login" element={<AdminLogin />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route path="/user-dashboard" element={<ProtectedRoute element={UserDashboard} allowedRoles={['user']} />} />
            <Route path="/sub-admin" element={<SubAdmin />} />
            {/* <Route path="/management-dashboard" element={<ProtectedRoute element={ManagementDashboard} allowedRoles={['management']} />}          /> */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
