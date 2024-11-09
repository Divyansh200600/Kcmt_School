import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { CircularProgress } from '@mui/material';
import { Search } from '@mui/icons-material'; // Icon for the search field
import Swal from 'sweetalert2';
import { firestore } from '../../utils/firebaseConfig';

const RoleMaster = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [search, setSearch] = useState(''); // State for search input
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
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
        setFilteredUsers(userList); // Initialize filtered users with all users
      } catch (error) {
        Swal.fire('Error', 'Failed to load users', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterUsers(e.target.value);
  };

  // Filter users based on search
  const filterUsers = (searchTerm) => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(lowercasedSearch) ||
      user.email.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredUsers(filtered);
  };

  // Handle role update
  const updateUserRole = async (userId, newRole) => {
    const userDoc = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDoc, { role: newRole });
      setUsers(users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      filterUsers(search); // Update filtered users after role change
      Swal.fire('Success', `Role updated to ${newRole}`, 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update role', 'error');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Role Management</h2>

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
