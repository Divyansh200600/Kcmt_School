import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { CircularProgress } from '@mui/material';
import { Search } from '@mui/icons-material';
import Swal from 'sweetalert2';  // Import Swal2 (SweetAlert2)
import { firestore } from '../../../utils/firebaseConfig';

const RoleMaster = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setUsers(userList);
        setFilteredUsers(userList);

        // Count total users and admins
        const totalUsers = userList.filter(user => user.role === 'user').length;
        const totalAdmins = userList.filter(user => user.role === 'admin').length;

        setUserCount(totalUsers);
        setAdminCount(totalAdmins);
      } catch (error) {
        showToast('error', 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterUsers(e.target.value);
  };

  const filterUsers = (searchTerm) => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(lowercasedSearch) ||
      user.email.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId, newRole) => {
    const userDoc = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDoc, { role: newRole });

      // Optimistically update both the users and filteredUsers state
      setUsers((prevUsers) => 
        prevUsers.map((user) => user.id === userId ? { ...user, role: newRole } : user)
      );

      setFilteredUsers((prevFilteredUsers) => 
        prevFilteredUsers.map((user) => user.id === userId ? { ...user, role: newRole } : user)
      );

      // Update counts after role change
      const updatedUserCount = users.filter(user => user.role === 'user').length;
      const updatedAdminCount = users.filter(user => user.role === 'admin').length;

      setUserCount(updatedUserCount);
      setAdminCount(updatedAdminCount);

      showToast('success', `Role updated to ${newRole}`);
    } catch (error) {
      showToast('error', 'Failed to update role');
    }
  };

  // Helper function to show toast notifications
  const showToast = (icon, message) => {
    Swal.fire({
      icon: icon,
      title: message,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      position: 'top-end',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Role Management</h2>

      {/* Display total users and admins count */}
      <div className="mb-6 flex justify-between">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md">
          <span>Total Users: </span>{userCount}
        </div>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md">
          <span>Total Admins: </span>{adminCount}
        </div>
      </div>

      {/* Search field */}
      <div className="flex items-center mb-6 bg-white shadow-md rounded-md overflow-hidden">
        <Search className="text-gray-500 mx-3" />
        <input
          type="text"
          className="p-2 flex-1 focus:outline-none"
          placeholder="Search by username or email"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100 transition-all">
                <td className="py-3 px-6">{user.username}</td>
                <td className="py-3 px-6">{user.email}</td>
                <td className="py-3 px-6">{user.role}</td>
                <td className="py-3 px-6 text-center">
                  {user.role === 'user' ? (
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition-all"
                      onClick={() => updateUserRole(user.id, 'admin')}
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition-all"
                      onClick={() => updateUserRole(user.id, 'user')}
                    >
                      Revoke Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoleMaster;
