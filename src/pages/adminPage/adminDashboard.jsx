import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dashboard, Group, School, LocalLibrary, LocationOn, Person, Build, 
  LibraryBooks, SchoolOutlined, Domain, ExpandMore, ExpandLess 
} from '@mui/icons-material';
import { Collapse } from '@mui/material';

// All Masters Import here ---->
import Db from '../../components/adminComps/dashboard';
import AddUser from '../../components/adminComps/addUser';
import RoleMaster from '../../components/adminComps/roleMaster';
import InstitutionMaster from '../../components/adminComps/institutionMaster';
import LevelBoardMaster from '../../components/adminComps/levelBoardMaster';
import DesignationMaster from '../../components/adminComps/designationMaster';
import SessionsMaster from '../../components/adminComps/sessionMaster';
import LocationMaster from '../../components/adminComps/locationMaster';
import LocationSub from '../../components/adminComps/locationSub';
import StreamMaster from '../../components/adminComps/streamMaster';
import StaffMaster from '../../components/adminComps/staffMaster';


// All Reports Imports Here ------>

import Reports from '../../components/userComps/reports';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open sidebar
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mastersOpen, setMastersOpen] = useState(false); // Toggle for Masters section
  const [reportsOpen, setReportsOpen] = useState(false); // Toggle for Reports section

  // Toggle sidebar on mobile screens
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle menu selection for active state
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  // Toggle expand/collapse for Masters section
  const toggleMasters = () => {
    setMastersOpen(!mastersOpen);
  };

  // Toggle expand/collapse for Reports section
  const toggleReports = () => {
    setReportsOpen(!reportsOpen);
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
        className={`transition-all duration-300 bg-gray-800 text-white p-6 flex flex-col space-y-6 fixed left-0 top-0 h-full z-50 md:w-64 ${
          sidebarOpen ? 'w-64' : 'w-20'
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
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
              activeMenu === 'dashboard' ? 'bg-gray-700' : ''
            }`}
            onClick={() => handleMenuClick('dashboard')}
          >
            <Dashboard />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </li>

          {/* Add User */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
              activeMenu === 'addUser' ? 'bg-gray-700' : ''
            }`}
            onClick={() => handleMenuClick('addUser')}
          >
            <Person />
            {sidebarOpen && <span className="font-medium">Add User</span>}
          </li>

          {/* Masters Section (Collapsible) */}
          <li>
            <div
              className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                mastersOpen ? 'bg-gray-700' : ''
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
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'roleMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('roleMaster')}
                >
                  <Group />
                  {sidebarOpen && <span className="font-medium">Role Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'institutionMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('institutionMaster')}
                >
                  <School />
                  {sidebarOpen && <span className="font-medium">Institute Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'levelBoardMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('levelBoardMaster')}
                >
                  <LocalLibrary />
                  {sidebarOpen && <span className="font-medium">Level/Board Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'designationMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('designationMaster')}
                >
                  <Person />
                  {sidebarOpen && <span className="font-medium">Designation</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'sessionMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('sessionMaster')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Session Master</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'locationMaster' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('locationMaster')}
                >
                  <LocationOn />
                  {sidebarOpen && <span className="font-medium">Region Master</span>}
                </li>
              </ul>
            </Collapse>
          </li>

          {/* Reports Section (Collapsible) */}
          <li>
            <div
              className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                reportsOpen ? 'bg-gray-700' : ''
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
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'report1' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('report1')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Report 1</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'report2' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('report2')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Report 2</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'report3' ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleMenuClick('report3')}
                >
                  <LibraryBooks />
                  {sidebarOpen && <span className="font-medium">Report 3</span>}
                </li>
                <li
                  className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${
                    activeMenu === 'report4' ? 'bg-gray-700' : ''
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
            <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-all">Profile</button>
            <button className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition-all">Logout</button>
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
          {activeMenu === 'locationSub' && <LocationSub />}
          {activeMenu === 'stream' && <StreamMaster />}
          {activeMenu === 'staffMaster' && <StaffMaster />}
          {activeMenu === 'report1' && <div><Reports/></div>}
          {activeMenu === 'report2' && <div>Report 2 content</div>}
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
