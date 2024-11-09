import React, { useState } from "react";
import { FaUser, FaCog, FaChartBar, FaBell, FaSearch } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Monthly Sales",
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-blue-600 text-white p-5 flex flex-col justify-between space-y-6">
        <div className="flex flex-col space-y-6">
          <div className="text-2xl font-semibold">Dashboard</div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-2 p-3 rounded-md ${
                activeTab === "overview" ? "bg-blue-700" : "hover:bg-blue-500"
              }`}
            >
              <FaUser className="text-lg" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center space-x-2 p-3 rounded-md ${
                activeTab === "analytics" ? "bg-blue-700" : "hover:bg-blue-500"
              }`}
            >
              <FaChartBar className="text-lg" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center space-x-2 p-3 rounded-md ${
                activeTab === "settings" ? "bg-blue-700" : "hover:bg-blue-500"
              }`}
            >
              <FaCog className="text-lg" />
              <span>Settings</span>
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <FaSearch className="text-lg" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-white focus:outline-none border-b-2 border-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-3xl font-semibold text-gray-800">Welcome back, User</div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <FaBell className="text-2xl" />
              <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                3
              </div>
            </div>
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150?img=7"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-lg font-semibold text-gray-800">User Information</div>
              <div className="mt-4 text-gray-600">Name: John Doe</div>
              <div className="text-gray-600">Email: johndoe@example.com</div>
              <div className="mt-4 text-gray-800">Member since: January 2020</div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-lg font-semibold text-gray-800">Monthly Earnings</div>
              <Line data={chartData} />
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-lg font-semibold text-gray-800">Recent Activity</div>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li>Completed task: Project X</li>
                <li>Joined new group: Marketing Team</li>
                <li>Added a new post: 'My Experience with React'</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-lg font-semibold text-gray-800">Sales Analytics</div>
              <Line data={chartData} />
            </div>

            {/* Detailed Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-lg font-semibold text-gray-800">Statistics</div>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li>Tasks completed: 35</li>
                <li>Projects pending: 3</li>
                <li>Messages: 12 unread</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-lg font-semibold text-gray-800">Account Settings</div>
            <form className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Change Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-md mt-2"
                    placeholder="newemail@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Change Password</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-md mt-2"
                    placeholder="********"
                  />
                </div>
                <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
