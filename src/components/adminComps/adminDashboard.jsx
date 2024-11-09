import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importing Link
import { Dashboard, Group, School, LocalLibrary, LocationOn, Person, Build, LibraryBooks, SchoolOutlined, Domain } from '@mui/icons-material'; // Importing the required icons
import AddUser from './addUser'; // Import the AddUser component

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open sidebar
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Toggle sidebar on mobile screens
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle menu selection for active state
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - Visible only on larger screens */}
      <div
        className={`transition-all duration-300 bg-gray-800 text-white p-6 flex flex-col space-y-6 fixed left-0 top-0 h-full z-50 md:w-64 ${sidebarOpen ? 'w-64' : 'w-20'} md:block hidden`}
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
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'dashboard' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            <Dashboard />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </li>

          {/* Add User */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'addUser' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('addUser')}
          >
            <Person />
            {sidebarOpen && <span className="font-medium">Add User</span>}
          </li>

          {/* Role Master */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'roleMaster' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('roleMaster')}
          >
            <Group />
            {sidebarOpen && <span className="font-medium">Role Master</span>}
          </li>

          {/* Institute */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'institute' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('institute')}
          >
            <School />
            {sidebarOpen && <span className="font-medium">Institute</span>}
          </li>

          {/* Level */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'level' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('level')}
          >
            <LocalLibrary />
            {sidebarOpen && <span className="font-medium">Level</span>}
          </li>

          {/* Designation */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'designation' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('designation')}
          >
            <Person />
            {sidebarOpen && <span className="font-medium">Designation</span>}
          </li>

          {/* Session */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'session' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('session')}
          >
            <LibraryBooks />
            {sidebarOpen && <span className="font-medium">Session</span>}
          </li>

          {/* Location */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'location' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('location')}
          >
            <LocationOn />
            {sidebarOpen && <span className="font-medium">Location</span>}
          </li>

          {/* Location Sub */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'locationSub' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('locationSub')}
          >
            <Domain />
            {sidebarOpen && <span className="font-medium">Location Sub</span>}
          </li>

          {/* Subject */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'subject' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('subject')}
          >
            <LibraryBooks />
            {sidebarOpen && <span className="font-medium">Subject</span>}
          </li>

          {/* Stream */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'stream' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('stream')}
          >
            <SchoolOutlined />
            {sidebarOpen && <span className="font-medium">Stream</span>}
          </li>

          {/* Staff Master */}
          <li
            className={`flex items-center space-x-4 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-700 ${activeMenu === 'staffMaster' ? 'bg-gray-700' : ''}`}
            onClick={() => handleMenuClick('staffMaster')}
          >
            <Build />
            {sidebarOpen && <span className="font-medium">Staff Master</span>}
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
          {activeMenu === 'dashboard' && <h2 className="text-2xl font-semibold">Dashboard</h2>}
          {activeMenu === 'addUser' && <AddUser />} {/* Render AddUser component */}
          {/* Add other components based on menu selection */}
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
