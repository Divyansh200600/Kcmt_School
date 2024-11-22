import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestore } from "../../../utils/firebaseConfig";

export default function ManageUser() {
  
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, "users");
        const querySnapshot = await getDocs(usersCollection);

        const userList = [];
        const adminList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Ensure required fields exist before accessing them
          if (data && data.role && data.username && data.email) {
            if (data.role === "admin") {
              adminList.push({ id: doc.id, ...data });
            } else {
              userList.push({ id: doc.id, ...data });
            }
          } else {
            console.warn(`Skipping document with missing data: ${doc.id}`);
          }
        });

        setUsers(userList); // Set the state for users
        setAdmins(adminList); // Set the state for admins
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Navigate based on the clicked user's UID
  const handleView = (uid) => {
    
  
    navigate(`/manage${uid}`);  
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Users</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border border-gray-300">Username</th>
                <th className="p-2 border border-gray-300">Department</th>
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2 border border-gray-300">{user.username}</td>
                  <td className="p-2 border border-gray-300">{user.department}</td>
                  <td className="p-2 border border-gray-300 text-center">
                    <button
                      onClick={() => handleView(user.id)}  // Pass the user's UID here
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Admins Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Admins</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border border-gray-300">Username</th>
                <th className="p-2 border border-gray-300">Department</th>
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2 border border-gray-300">{admin.username}</td>
                  <td className="p-2 border border-gray-300">{admin.department}</td>
                  <td className="p-2 border border-gray-300 text-center">
                    <button
                      onClick={() => handleView(admin.id)}  // Pass the admin's UID here
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
