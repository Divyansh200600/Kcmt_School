import React, { useState } from 'react';
import { FaTachometerAlt, FaCogs, FaChartLine, FaUserCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const data = [
  { name: 'Mon', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Tue', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Wed', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Thu', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Fri', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Sat', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Sun', uv: 3490, pv: 4300, amt: 2100 },
];

const SubAdmin = () => {
  const [currentSection, setCurrentSection] = useState('dashboard'); // To toggle between sections

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-center text-green-400 mb-8">Futuristic Admin</h2>
        <div className="flex flex-col space-y-4">
          <button onClick={() => setCurrentSection('dashboard')} className="flex items-center space-x-2 text-lg hover:bg-green-500 py-2 px-4 rounded">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setCurrentSection('charts')} className="flex items-center space-x-2 text-lg hover:bg-green-500 py-2 px-4 rounded">
            <FaChartLine />
            <span>Charts</span>
          </button>
          <button onClick={() => setCurrentSection('profile')} className="flex items-center space-x-2 text-lg hover:bg-green-500 py-2 px-4 rounded">
            <FaUserCircle />
            <span>Profile</span>
          </button>
          <button onClick={() => setCurrentSection('settings')} className="flex items-center space-x-2 text-lg hover:bg-green-500 py-2 px-4 rounded">
            <FaCogs />
            <span>Settings</span>
          </button>
        </div>
        <div className="mt-auto text-center text-xs">
          <p>&copy; 2024 Admin Panel</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard Section */}
        {currentSection === 'dashboard' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Dashboard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-teal-500 text-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold">Active Users</h4>
                <p className="text-3xl font-bold">1500</p>
              </div>
              <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold">Sales This Week</h4>
                <p className="text-3xl font-bold">$15,000</p>
              </div>
              <div className="bg-orange-400 text-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold">Revenue Growth</h4>
                <p className="text-3xl font-bold">8.5%</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {currentSection === 'charts' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Revenue Growth Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Profile Section */}
        {currentSection === 'profile' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">User Profile</h3>
            <p className="text-lg"><strong>Username:</strong> AdminUser</p>
            <p className="text-lg"><strong>Email:</strong> admin@futuristic.com</p>
          </div>
        )}

        {/* Settings Section */}
        {currentSection === 'settings' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Settings</h3>
            <p className="text-lg"><strong>Dark Mode:</strong> Toggle dark/light mode for the dashboard</p>
            <p className="text-lg"><strong>Notifications:</strong> Enable/Disable notifications for updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAdmin;
