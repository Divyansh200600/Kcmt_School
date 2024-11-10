import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, doc, getDoc } from "firebase/firestore"; 

import "../../utils/firebaseConfig"; 

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore

  // Map Firebase error codes to user-friendly messages
  const firebaseErrorMessages = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-disabled": "Your account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "The password you entered is incorrect.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/too-many-requests": "Too many login attempts. Please try again later.",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        setLoading(false);
        const user = userCredential.user;

        // Fetch user data from Firestore using UID
        const userDocRef = doc(db, "users", user.uid);  // Reference to the user's document
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const username = userData.username;

          // Store username in localStorage or state for use in UserDashboard
          localStorage.setItem("username", username); // For now, we're using localStorage to persist the username.
          
          // Show success message
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Login successful!",
            showConfirmButton: false,
            timer: 1500,
            toast: true, // Makes it smaller and positions it at the top
            customClass: {
              popup: 'swal2-sm-toast', // Custom class for smaller size
            },
          });

          // Redirect to user dashboard
          navigate("/user-dashboard");
        } else {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "No user data found!",
            text: "Please contact support.",
            showConfirmButton: false,
            timer: 2000,
            toast: true, 
            customClass: {
              popup: 'swal2-sm-toast',
            },
          });
        }
      })
      .catch((error) => {
        setLoading(false);

        // Get user-friendly error message
        const errorMessage = firebaseErrorMessages[error.code] || "An unexpected error occurred. Please try again later.";

        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Login failed!",
          text: errorMessage,
          showConfirmButton: false,
          timer: 2000,
          toast: true, 
          customClass: {
            popup: 'swal2-sm-toast',
          },
        });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="p-8 w-full max-w-md bg-opacity-20 bg-gray-800 rounded-xl shadow-xl border border-gray-700 backdrop-filter backdrop-blur-lg">
        {/* Title */}
        <h2 className="text-3xl text-center font-extrabold text-white mb-8 tracking-widest">
          <span className="text-purple-500">U</span>ser <span className="text-purple-500">L</span>ogin
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <label className="absolute top-2 left-3 text-sm text-gray-400">
              <FaUser />
            </label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-gray-200 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="absolute top-2 left-3 text-sm text-gray-400">
              <FaLock />
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 pl-10 pr-10 text-gray-200 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 mt-6 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:bg-gradient-to-l transition-all duration-500 ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-purple-500/50 shadow-lg"}`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
