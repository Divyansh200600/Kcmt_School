import React, { useState, useEffect } from 'react';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, getDocs, query, addDoc, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function AddSchool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boardCounts, setBoardCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  const fetchData = async () => {
    const schoolRef = collection(firestore, 'schoolData');
    const q = query(schoolRef, orderBy('SN', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = {};
    const counts = {};

    querySnapshot.forEach((doc) => {
      const board = doc.data().BOARD || 'Unknown';
      if (!data[board]) {
        data[board] = [];
        counts[board] = 0;
      }
      data[board].push(doc.data());
      counts[board] += 1;
    });

    setUploadedData(data);
    setBoardCounts(counts); // Set board counts for display
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile?.name.split('.').pop();

    if (!validExtensions.includes(`.${fileExtension}`)) {
      alert('Unsupported file type. Please upload a file with one of the following extensions: .xlsx, .xls, .csv');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const getNextUID = async (board) => {
    const schoolRef = collection(firestore, 'schoolData');
    const q = query(schoolRef, orderBy('SN', 'asc'));
    const querySnapshot = await getDocs(q);
    const boardData = querySnapshot.docs.filter((doc) => doc.data().BOARD === board);

    if (boardData.length === 0) {
      return `SID-${board.replace(/\s+/g, '')}-001`;
    } else {
      const lastDoc = boardData[boardData.length - 1];
      const lastSN = parseInt(lastDoc.data().SN || 0, 10);
      const nextSN = lastSN + 1;
      return `SID-${board.replace(/\s+/g, '')}-${nextSN.toString().padStart(3, '0')}`;
    }
  };

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
        const boardType = sheetData[0]?.BOARD || 'Unknown';
        const schoolRef = collection(firestore, 'schoolData');
        const uploaded = [];

        for (let i = 0; i < sheetData.length; i++) {
          const nextUID = await getNextUID(boardType);
          const docData = {
            ...sheetData[i],
            uid: nextUID,
            BOARD: boardType,
            SN: parseInt(nextUID.split('-').pop(), 10),
          };
          await addDoc(schoolRef, docData);
          uploaded.push(docData);
        }

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

  const handleBoardChange = (board) => {
    setSelectedBoard(board);
    setCurrentPage(1);
  };

  const handleDownloadTemplate = () => {
    const sampleData = [
      { SN: 1, BOARD: 'CBSE OR UP BOARD OR ICSE OR NIOS OR COACHING OR OTHER', LOCATION: 'Delhi', 'SUB LOCATION': 'South', 'NAME OF SCHOOL': 'XYZ School' },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'SchoolDataTemplate.xlsx');
  };

  const currentData = selectedBoard
    ? uploadedData[selectedBoard]?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload School Data</h1>

        <button
          onClick={handleDownloadTemplate}
          className="mb-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Download Template
        </button>

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

        <div className="mb-6">
          <div className="flex space-x-4 border-b-2">
            {Object.keys(uploadedData).map((board, index) => {
              const colors = [
                'bg-red-500 text-white',
                'bg-green-500 text-white',
                'bg-blue-500 text-white',
                'bg-yellow-500 text-black',
                'bg-purple-500 text-white',
                'bg-pink-500 text-white',
                'bg-teal-500 text-white',
              ];

              const colorClass = colors[index % colors.length];
              const selectedClass =
                selectedBoard === board ? `border-b-4 border-black` : colorClass;

              return (
                <button
                  key={board}
                  className={`px-4 py-2 text-lg font-semibold focus:outline-none rounded-lg ${selectedClass}`}
                  onClick={() => handleBoardChange(board)}
                >
                  {board} ({boardCounts[board] || 0}) {/* Show count */}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {selectedBoard ? (
            <>
              <h3 className="text-lg font-semibold mb-2">{selectedBoard} Data</h3>
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
                  {currentData.map((data, index) => (
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

              <div className="flex justify-between mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  disabled={currentData.length < rowsPerPage}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>Select a board to see the data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
