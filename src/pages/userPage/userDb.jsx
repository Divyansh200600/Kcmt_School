import React, { useEffect, useState } from "react";
import { FaSchool, FaBookOpen, FaUniversity, FaGraduationCap, FaChalkboardTeacher, FaDatabase, FaTelegram,FaEye } from "react-icons/fa";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebaseConfig";
import DataForm from '../../components/userComps/dataForm';
import ViewDataForm from "../../comp../../components/userComps/viewDataForm";
import ICSE from "../../components/userComps/ICSE";
import Reports from '../../components/userComps/reports';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("dataForm");
  const [username, setUsername] = useState(""); 
  const [loading, setLoading] = useState(true); 
  const user = auth.currentUser; 

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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 via-blue-200 to-indigo-300 text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-lg text-gray-800 p-6 flex flex-col justify-between space-y-6 rounded-xl">
        <div className="flex flex-col space-y-6">
          <div className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-500">
            {username ? `${username}'s Dashboard` : "Loading..."}
          </div>
          <div className="flex flex-col space-y-2">
            {/* Sidebar Buttons */}
            <button
              onClick={() => setActiveTab("dataForm")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "dataForm" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaDatabase className="text-lg" />
              <span>Data Form</span>
            </button>
            <button
              onClick={() => setActiveTab("manageDataForm")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "manageDataForm" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaEye className="text-lg" />
              <span>View Data Form</span>
            </button>
            <button
              onClick={() => setActiveTab("icse")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "icse" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaSchool className="text-lg" />
              <span>ICSE School</span>
            </button>
            <button
              onClick={() => setActiveTab("cbse")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "cbse" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaBookOpen className="text-lg" />
              <span>CBSE School</span>
            </button>
            <button
              onClick={() => setActiveTab("upBoard")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "upBoard" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaUniversity className="text-lg" />
              <span>UP Board School</span>
            </button>
            <button
              onClick={() => setActiveTab("nios")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "nios" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaGraduationCap className="text-lg" />
              <span>NIOS</span>
            </button>
            <button
              onClick={() => setActiveTab("coaching")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "coaching" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaChalkboardTeacher className="text-lg" />
              <span>Coaching</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-200 ${activeTab === "reports" ? "bg-blue-300 text-white" : "hover:bg-blue-200"}`}
            >
              <FaTelegram className="text-lg" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-3xl font-semibold text-gray-900">
            {username ? `Welcome, ${username}` : "Loading..."}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white p-6 rounded-lg shadow-xl ">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
