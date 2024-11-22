import React, { useState, useEffect } from 'react';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, getDocs, query, addDoc, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function AddSchool() {
  const [file, setFile] = useState(null); // Holds the uploaded file
  const [loading, setLoading] = useState(false); // Loading state for upload
  const [uploadedData, setUploadedData] = useState({}); // Store data for each board
  const [selectedBoard, setSelectedBoard] = useState(null); // Track selected board
  const [boardCounts, setBoardCounts] = useState({}); 

  // Fetch data from Firestore
  const fetchData = async () => {
    const schoolRef = collection(firestore, 'schoolData');
    // Order by SN in ascending order
    const q = query(schoolRef, orderBy('SN', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = {};
    const counts = {};

    querySnapshot.forEach((doc) => {
      const board = doc.data().BOARD || 'Unknown';
      if (!data[board]) {
        data[board] = [];
        counts[board] = 0; // Initialize count for each board
      }
      data[board].push(doc.data());
      counts[board] += 1; // Increment count for the board
    });

    setUploadedData(data);
    setBoardCounts(counts);
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Function to automatically detect the board type from the uploaded data
  const detectBoardType = (sheetData) => {
    if (sheetData.length > 0) {
      const board = sheetData[0].BOARD || 'Unknown'; // Detect the BOARD from the first row
      return board;
    }
    return 'Unknown';
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Generate Next UID for Firestore
  const getNextUID = async (board) => {
    const schoolRef = collection(firestore, 'schoolData');
    const q = query(schoolRef, orderBy('SN', 'asc'));
    const querySnapshot = await getDocs(q);
    const boardData = querySnapshot.docs.filter((doc) => doc.data().BOARD === board);

    if (boardData.length === 0) {
      return `SID-${board.replace(/\s+/g, '')}-001`; // Start with SID-{Board}-001 if no data exists
    } else {
      const lastDoc = boardData[boardData.length - 1]; // Get last document
      const lastSN = parseInt(lastDoc.data().SN || 0, 10);
      const nextSN = lastSN + 1;
      return `SID-${board.replace(/\s+/g, '')}-${nextSN.toString().padStart(3, '0')}`;
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return alert('Please upload a file.');

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const boardType = detectBoardType(sheetData); // Detect the board from the data
        const schoolRef = collection(firestore, 'schoolData');
        const uploaded = [];

        // Loop through the sheet data and upload to Firestore
        for (let i = 0; i < sheetData.length; i++) {
          const nextUID = await getNextUID(boardType);
          const docData = {
            ...sheetData[i],
            uid: nextUID,
            BOARD: boardType,
            SN: parseInt(nextUID.split('-').pop(), 10), // Extract SN from UID
          };
          await addDoc(schoolRef, docData);
          uploaded.push(docData);
        }

        // After upload, re-fetch the data to ensure it’s displayed
        fetchData();
        
        alert(`${boardType} data uploaded successfully!`);
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  };

  // Handle board selection (tabs)
  const handleBoardChange = (board) => {
    setSelectedBoard(board); // Set the selected board to filter data
  };

  // Get total schools count for the selected board
  const getSelectedBoardCount = () => {
    return selectedBoard ? boardCounts[selectedBoard] : 0; // Return count for selected board
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload School Data</h1>

        {/* Display Total Schools for the Selected Board (Top Right Corner) */}
        <div className="absolute top-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-lg">
          <span>Total Schools: </span>
          {getSelectedBoardCount()} {/* Show the count for the selected board */}
        </div>

        {/* File Upload */}
        <div className="flex flex-col items-center space-y-4 mb-4">
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Board Selection (Tabs) */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b-2">
            {Object.keys(uploadedData).map((board) => (
              <button
                key={board}
                className={`px-4 py-2 text-lg font-semibold focus:outline-none ${selectedBoard === board ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => handleBoardChange(board)}
              >
                {board}
              </button>
            ))}
          </div>
        </div>

        {/* Display Data for Selected Board */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded School Data</h2>

          {/* Display data for selected board */}
          {selectedBoard ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">{selectedBoard} Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">SN</th>
                      <th className="border border-gray-300 px-4 py-2">Board</th>
                      <th className="border border-gray-300 px-4 py-2">Location</th>
                      <th className="border border-gray-300 px-4 py-2">Sub Location</th>
                      <th className="border border-gray-300 px-4 py-2">Name of School</th>
                      <th className="border border-gray-300 px-4 py-2">UID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData[selectedBoard]?.map((data, index) => (
                      <tr key={index} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">{data.SN}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.BOARD}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.LOCATION}</td>
                        <td className="border border-gray-300 px-4 py-2">{data['SUB LOCATION']}</td>
                        <td className="border border-gray-300 px-4 py-2">{data['NAME OF SCHOOL']}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.uid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p>Select a board to see the data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
