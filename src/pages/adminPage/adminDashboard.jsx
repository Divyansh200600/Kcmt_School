import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dashboard, Group, School, LocalLibrary, LocationOn, Person, SchoolRounded,AssignmentLateTwoTone,
  LibraryBooks, SchoolOutlined, Stream, ExpandMore, ExpandLess, LocationCity, SupervisedUserCircle
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';

// All Masters Import here ---->
import Db from '../../components/adminComps/Masters/dashboard';
import AddUser from '../../components/adminComps/Masters/addUser';
import RoleMaster from '../../components/adminComps/Masters/roleMaster';
import InstitutionMaster from '../../components/adminComps/Masters/institutionMaster';
import LevelBoardMaster from '../../components/adminComps/Masters/levelBoardMaster';
import DesignationMaster from '../../components/adminComps/Masters/designationMaster';
import SessionsMaster from '../../components/adminComps/Masters/sessionMaster';
import LocationMaster from '../../components/adminComps/Masters/locationMaster';
import LocationSub from '../../components/adminComps/Masters/locationSub';
import StreamMaster from '../../components/adminComps/Masters/streamMaster';
import StaffMaster from '../../components/adminComps/Masters/staffMaster';
import AddSchool from '../../components/adminComps/Masters/addSchool';
import ManageUsers from '../../components/adminComps/Masters/manageUser';
import Swal from 'sweetalert2';

// All Reports Imports Here ------>

import AssignUserRoles from '../../components/adminComps/Roles/assignUserRoles';

// All Reports Imports Here ------>

import Reports from '../../components/adminComps/Reports/schoolInfoReport';
import SchoolData from '../../components/adminComps/Reports/schoolData';
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mastersOpen, setMastersOpen] = useState(false); 
  const [reportsOpen, setReportsOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
 
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAssignRole = () => {
    setAssignRoleOpen((prev) => !prev);
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const toggleMasters = () => {
    setMastersOpen(!mastersOpen);
  };

  const toggleReports = () => {
    setReportsOpen(!reportsOpen);
  };

  
  const handleLogout = async () => {
    try {
      // Show a toast-style confirmation before logout
      Swal.fire({
        title: 'Logging out...',
        text: 'You are being logged out.',
        icon: 'info',
        toast: true, // Enables toast notification
        position: 'top-right', // Position the toast in the top-right corner
        showConfirmButton: false, // No need for a confirm button
        timer: 2000, // Duration for the toast (in ms)
        timerProgressBar: true, // Show a progress bar for the timer
      });

      // Sign out from Firebase Authentication
      await signOut(auth);

      // Show a success toast after logging out
      Swal.fire({
        title: 'Successfully logged out!',
        icon: 'success',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      // Navigate to the login page
      navigate('/SIS-login');
    } catch (error) {
      console.error("Error logging out:", error);

      // Show an error toast if there's a problem
      Swal.fire({
        title: 'Error logging out!',
        text: 'There was an issue with logging out.',
        icon: 'error',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Internal CSS for custom scrollbar */}
      <style>
        {`
          .sidebar-scrollbar {
            overflow-y: auto;
          }
          .sidebar-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .sidebar-scrollbar::-webkit-scrollbar-track {
            background: #1f2937; /* Track color */
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4b5563; /* Thumb color */
            border-radius: 4px; /* Rounded thumb */
            border: 2px solid #1f2937; /* Adds padding around the thumb */
          }
          /* For Firefox */
          .sidebar-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 #1f2937;
          }
        `}
      </style>

      <div
        className={`transition-all duration-300 bg-gray-800 text-white p-6 flex flex-col space-y-6 fixed left-0 top-0 h-full z-50 md:w-64 ${sidebarOpen ? 'w-64' : 'w-20'
          } md:block hidden sidebar-scrollbar`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Dashboard className="text-white text-2xl" />
            {sidebarOpen && <div className="text-xl font-semibold">Admin Panel</div>}
          </div>
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            <span className="material-icons">menu</span>
          </button>
        </div>

        <ul className="space-y-6 mt-6">
          {/* Dashboard Menu */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'dashboard' ? 'bg-gray-700' : ''
              }`}
            onClick={() => handleMenuClick('dashboard')}
          >
            <Dashboard />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </li>

          {/* Add User */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'addUser' ? 'bg-gray-700' : ''
              }`}
            onClick={() => handleMenuClick('addUser')}
          >
            <Person />
            {sidebarOpen && <span className="font-medium">Add User</span>}
          </li>

          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'manageUsers' ? 'bg-gray-700' : ''
              }`}
            onClick={() => handleMenuClick('manageUsers')}
          >
            <SupervisedUserCircle />
            {sidebarOpen && <span className="font-medium">Manage Users</span>}
          </li>

          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'addSchool' ? 'bg-gray-700' : ''
              }`}
            onClick={() => handleMenuClick('addSchool')}
          >
            <SchoolRounded />
            {sidebarOpen && <span className="font-medium">Add School</span>}
          </li>

          {/* Masters Section (Collapsible) */}
          <li>
            <div
              className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${mastersOpen ? 'bg-gray-700' : ''
                }`}
              onClick={toggleMasters}
            >
              <Group />
              {sidebarOpen && <span className="font-medium">Masters</span>}
              <span className="ml-auto">
                {mastersOpen ? <ExpandLess /> : <ExpandMore />}
              </span>
            </div>
            <Collapse in={mastersOpen}>
              <ul className="space-y-4 pl-8">
                {/* Master Items */}
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'roleMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('roleMaster')}
                >
                  <Group />
                  {sidebarOpen && <span className="font-medium">Role Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'institutionMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('institutionMaster')}
                >
                  <School />
                  {sidebarOpen && <span className="font-medium">Institute Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'levelBoardMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('levelBoardMaster')}
                >
                  <LocalLibrary />
                  {sidebarOpen && <span className="font-medium">Level/Board Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'designationMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('designationMaster')}
                >
                  <Person />
                  {sidebarOpen && <span className="font-medium">Designation</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'sessionMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('sessionMaster')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Session Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'locationMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('locationMaster')}
                >
                  <LocationOn />
                  {sidebarOpen && <span className="font-medium">Region Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'locationSubMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('locationSubMaster')}
                >
                  <LocationCity />
                  {sidebarOpen && <span className="font-medium">Region Sub Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'streamMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('streamMaster')}
                >
                  <Stream />
                  {sidebarOpen && <span className="font-medium">Stream Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'staffMaster' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('staffMaster')}
                >
                  <SchoolOutlined />
                  {sidebarOpen && <span className="font-medium">Staff Master</span>}
                </li>

              </ul>
            </Collapse>
          </li>

          {/* Assign Role Section (Collapsible) */}
          <li>
            <div
              className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${assignRoleOpen ? 'bg-gray-700' : ''}`}
              onClick={toggleAssignRole} // Function to toggle the visibility of the "Assign Role" section
            >
              {/* Replace with an appropriate icon */}
              <AssignmentLateTwoTone />
              {sidebarOpen && <span className="font-medium">Assign Role</span>}
              <span className="ml-auto">
                {assignRoleOpen ? <ExpandLess /> : <ExpandMore />}
              </span>
            </div>
            <Collapse in={assignRoleOpen}>
              <ul className="space-y-4 pl-8">
                {/* Dummy Role Items */}
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'role1' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('role1')}
                >
                  {/* Replace with an appropriate icon for "Role 1" */}
                  <AssignmentLateTwoTone />
                  {sidebarOpen && <span className="font-medium">Assign User Role</span>}
                </li>
              
              </ul>
            </Collapse>
          </li>

          {/* Reports Section (Collapsible) */}
          <li>
            <div
              className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${reportsOpen ? 'bg-gray-700' : ''
                }`}
              onClick={toggleReports}
            >
              <LibraryBooks />
              {sidebarOpen && <span className="font-medium">Reports</span>}
              <span className="ml-auto">
                {reportsOpen ? <ExpandLess /> : <ExpandMore />}
              </span>
            </div>
            <Collapse in={reportsOpen}>
              <ul className="space-y-4 pl-8">
                {/* Dummy Report Items */}
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'report1' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('report1')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">S.I Report</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'report2' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('report2')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">School Data</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'report3' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('report3')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Report 3</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'report4' ? 'bg-gray-700' : ''
                    }`}
                  onClick={() => handleMenuClick('report4')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Report 4</span>}
                </li>
              </ul>
            </Collapse>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex space-x-4">
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition-all">Logout</button>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 p-6 overflow-auto">
          {activeMenu === 'dashboard' && <h2 className="text-2xl font-semibold"><Db /></h2>}
          {activeMenu === 'addUser' && <AddUser />}
          {activeMenu === 'roleMaster' && <RoleMaster />}
          {activeMenu === 'institutionMaster' && <InstitutionMaster />}
          {activeMenu === 'levelBoardMaster' && <LevelBoardMaster />}
          {activeMenu === 'designationMaster' && <DesignationMaster />}
          {activeMenu === 'sessionMaster' && <SessionsMaster />}
          {activeMenu === 'locationMaster' && <LocationMaster />}
          {activeMenu === 'locationSubMaster' && <LocationSub />}
          {activeMenu === 'streamMaster' && <StreamMaster />}
          {activeMenu === 'staffMaster' && <StaffMaster />}
          {activeMenu === 'addSchool' && <AddSchool />}
          {activeMenu === 'manageUsers' && <ManageUsers />}


          {activeMenu === 'role1' && <AssignUserRoles/>}


          {activeMenu === 'report1' && <div><Reports /></div>}
          {activeMenu === 'report2' && <div><SchoolData /></div>}
          {activeMenu === 'report3' && <div>Report 3 content</div>}
          {activeMenu === 'report4' && <div>Report 4 content</div>}
        </div>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-around items-center shadow-md">
        <Link to="/" className="flex flex-col items-center space-y-1">
          <Dashboard />
          <span className="text-sm">Home</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center space-y-1">
          <Person />
          <span className="text-sm">Profile</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center space-y-1">
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
