import React, { useEffect, useState } from "react";
import {
  FaSchool, FaBookOpen, FaUniversity, FaGraduationCap,
  FaChalkboardTeacher, FaDatabase, FaTelegram, FaEye,
  FaLock, FaChevronDown, FaChevronUp, FaUser
} from "react-icons/fa";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebaseConfig";
import DataForm from '../../components/userComps/dataForm';
import ViewDataForm from "../../components/userComps/viewDataForm";
import ICSE from "../../components/userComps/ICSE";
import Reports from '../../components/adminComps/Reports/schoolInfoReport';
import Swal from 'sweetalert2';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("dataForm");
  const [username, setUsername] = useState("");
  const [isSchoolsExpanded, setIsSchoolsExpanded] = useState(false);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          } else {
            console.error("No such user!");
          }
        } catch (error) {
          console.error("Error fetching username: ", error);
        }
      }
    };

    if (user) {
      fetchUsername();
    }
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "dataForm":
        return <div><DataForm /></div>;
      case "manageDataForm":
        return <div><ViewDataForm /></div>;
      case "icse":
        return <div><ICSE /></div>;
      case "reports":
        return <div><Reports /></div>;
      case "cbse":
        return <div>Welcome to the CBSE School Dashboard.</div>;
      case "upBoard":
        return <div>Welcome to the U.P. Board School Dashboard.</div>;
      case "nios":
        return <div>Welcome to the NIOS Dashboard.</div>;
      case "coaching":
        return <div>Welcome to the Coaching Dashboard.</div>;
      case "profile":
        return <div>
          <h2 className="text-xl font-bold mb-4">Profile Page</h2>
          <p>Username: {username}</p>
          <p>Email: {user?.email}</p>
        </div>;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    try {
      Swal.fire({
        title: 'Logging out...',
        text: 'You are being logged out.',
        icon: 'info',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      await signOut(auth);

      Swal.fire({
        title: 'Successfully logged out!',
        icon: 'success',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      navigate('/SIS-login');
    } catch (error) {
      console.error("Error logging out:", error);
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
    <div className="min-h-screen bg-gradient-to-r from-green-100 via-blue-200 to-indigo-300 text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className="w-full md:w-64 bg-white shadow-lg text-gray-800 p-6 flex flex-col justify-between space-y-6 rounded-xl overflow-y-auto"
        style={{ height: "100vh", position: "sticky", top: "0" }}
      >
        <div className="flex flex-col space-y-6">
          <div className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-500">
            {username ? `${username}'s Dashboard` : "Loading..."}
          </div>
          <div className="flex flex-col space-y-2">
            {/* Sidebar Buttons */}
            <button
              onClick={() => setActiveTab("dataForm")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "dataForm" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                }`}
            >
              <FaDatabase className="text-lg" />
              <span>Data Form</span>
            </button>
            <button
              onClick={() => setActiveTab("manageDataForm")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "manageDataForm" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                }`}
            >
              <FaEye className="text-lg" />
              <span>View Data Form</span>
            </button>
            {/* Expand/Collapse Schools Section */}
            <button
              onClick={() => setIsSchoolsExpanded(!isSchoolsExpanded)}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <FaSchool className="text-lg" />
                <span>Schools</span>
              </div>
              {isSchoolsExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {isSchoolsExpanded && (
              <div className="ml-4 flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab("icse")}
                  className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "icse" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                    }`}
                >
                  <FaSchool className="text-lg" />
                  <span>ICSE School</span>
                </button>
                <button
                  onClick={() => setActiveTab("cbse")}
                  className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "cbse" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                    }`}
                >
                  <FaBookOpen className="text-lg" />
                  <span>CBSE School</span>
                </button>
                <button
                  onClick={() => setActiveTab("upBoard")}
                  className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "upBoard" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                    }`}
                >
                  <FaUniversity className="text-lg" />
                  <span>UP Board </span>
                </button>
                <button
                  onClick={() => setActiveTab("nios")}
                  className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "nios" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                    }`}
                >
                  <FaGraduationCap className="text-lg" />
                  <span>NIOS</span>
                </button>
                <button
                  onClick={() => setActiveTab("coaching")}
                  className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "coaching" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                    }`}
                >
                  <FaChalkboardTeacher className="text-lg" />
                  <span>Coaching</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "reports" ? "bg-blue-300 text-white" : "hover:bg-blue-200"
                }`}
            >
              <FaTelegram className="text-lg" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Strip */}
        <div
          className="sticky top-0 bg-indigo-300 text-white flex justify-between items-center p-6 shadow-md z-50"
        >
          <div className="text-lg font-bold">
            Welcome, {username ? username : "User"}🌟
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-all duration-200"
            >
              <FaUser />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-all duration-200"
            >
              <FaLock />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default UserDashboard;
