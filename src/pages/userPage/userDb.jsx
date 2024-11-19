import React, { useEffect, useState } from "react";
import { FaSchool, FaBookOpen, FaUniversity, FaGraduationCap, FaChalkboardTeacher, FaDatabase ,FaTelegram} from "react-icons/fa";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebaseConfig";
import DataForm from '../../components/userComps/dataForm';

import ICSE from "../../components/userComps/ICSE";
import Reports from '../../components/userComps/reports';
const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("dataForm");
  const [username, setUsername] = useState(""); 
  const user = auth.currentUser; 
  useEffect(() => {
    // Fetch username from Firestore when the component mounts
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid); // Fetch the user document by UID
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username); // Set the username from Firestore
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

  // Main content for each tab
  const renderContent = () => {
    switch (activeTab) {
      case "dataForm":
        return <div className="text-lg"><DataForm /></div>;
      case "icse":
        return <div className="text-lg"><ICSE/></div>;
        case "reports":
        return <div className="text-lg"><Reports/></div>;
      case "cbse":
        return <div className="text-lg">Welcome to the CBSE School Dashboard.</div>;
      case "upBoard":
        return <div className="text-lg">Welcome to the U.P. Board School Dashboard.</div>;
      case "nios":
        return <div className="text-lg">Welcome to the NIOS Dashboard.</div>;
      case "coaching":
        return <div className="text-lg">Welcome to the Coaching Dashboard.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-blue-600 text-white p-5 flex flex-col justify-between space-y-6">
        <div className="flex flex-col space-y-6">
          <div className="text-2xl font-semibold">{username ? `${username}'s Dashboard` : "Loading..."}</div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("dataForm")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "dataForm" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaDatabase className="text-lg" />
              <span>Data Form</span>
            </button>
            <button
              onClick={() => setActiveTab("icse")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "icse" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaSchool className="text-lg" />
              <span>ICSE School</span>
            </button>
            <button
              onClick={() => setActiveTab("cbse")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "cbse" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaBookOpen className="text-lg" />
              <span>CBSE School</span>
            </button>
            <button
              onClick={() => setActiveTab("upBoard")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "upBoard" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaUniversity className="text-lg" />
              <span>U.P. Board School</span>
            </button>
            <button
              onClick={() => setActiveTab("nios")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "nios" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaGraduationCap className="text-lg" />
              <span>NIOS</span>
            </button>
            <button
              onClick={() => setActiveTab("coaching")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "coaching" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaChalkboardTeacher className="text-lg" />
              <span>Coaching</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center space-x-2 p-3 rounded-md ${activeTab === "reports" ? "bg-blue-700" : "hover:bg-blue-500"}`}
            >
              <FaTelegram className="text-lg" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-3xl font-semibold text-gray-800">
            {username ? `Welcome , ${username}` : "Loading..."}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
