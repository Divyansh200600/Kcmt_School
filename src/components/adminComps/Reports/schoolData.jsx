import React, { useEffect, useState } from 'react';
import { firestore } from '../../../utils/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SchoolData() {
  const [schoolData, setSchoolData] = useState([]); // Full dataset
  const [filteredData, setFilteredData] = useState([]); // Filtered dataset
  const [selectedBoard, setSelectedBoard] = useState(''); // Track selected board (sheet)
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSubLocation, setSelectedSubLocation] = useState('');
  const [availableSubLocations, setAvailableSubLocations] = useState([]);
  const [boardTotals, setBoardTotals] = useState({}); // Track totals for each board

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Limit items per page

  // Fetch school data from Firestore on component load
  useEffect(() => {
    const fetchData = async () => {
      const schoolRef = collection(firestore, 'schoolData');
      const q = query(schoolRef, orderBy('SN', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchoolData(data);
      setFilteredData(data); // Initially show all data

      // Calculate board totals
      const totals = data.reduce((acc, item) => {
        const board = item.BOARD;
        acc[board] = (acc[board] || 0) + 1;
        return acc;
      }, {});
      setBoardTotals(totals); // Store totals for each board
    };

    fetchData();
  }, []);

  // Handle changes in Board filter
  const handleBoardChange = (e) => {
    setSelectedBoard(e.target.value);
  };

  // Handle changes in Location filter
  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);

    // Update sub-location options based on selected location
    const subLocations = schoolData
      .filter((item) => item.LOCATION === location)
      .map((item) => item['SUB LOCATION']);
    setAvailableSubLocations([...new Set(subLocations)]);
    setSelectedSubLocation(''); // Reset sub-location if location changes
  };

  // Handle changes in Sub-location filter
  const handleSubLocationChange = (e) => {
    setSelectedSubLocation(e.target.value);
  };

  // Filter the data based on selected criteria
  useEffect(() => {
    const filtered = schoolData.filter((item) => {
      return (
        (!selectedBoard || item.BOARD === selectedBoard) &&
        (!selectedLocation || item.LOCATION === selectedLocation) &&
        (!selectedSubLocation || item['SUB LOCATION'] === selectedSubLocation)
      );
    });
    setFilteredData(filtered); // Update the filtered data
    setCurrentPage(1); // Reset to the first page when filters change
  }, [selectedBoard, selectedLocation, selectedSubLocation, schoolData]);

  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Generate a filtered PDF
  const generateCustomFilteredPDF = () => {
    const doc = new jsPDF();

    // Add centered title
    doc.setFontSize(18);
    doc.text('School Information Data', doc.internal.pageSize.getWidth() / 2, 20, {
      align: 'center',
    });

    const tableData = currentItems.map((data) => [
      data.SN,
      data.BOARD,
      data.LOCATION,
      data['SUB LOCATION'],
      data['NAME OF SCHOOL'],
      data.uid,
    ]);

    // Create PDF table
    doc.autoTable({
      startY: 30, // Space below the title
      head: [['SN', 'Board', 'Location', 'Sub Location', 'Name of School', 'UID']],
      body: tableData,
    });

    // Save the PDF
    doc.save('FilteredSchoolData.pdf');
  };

  // Handle Next and Previous buttons
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">School Information Data</h1>

        {/* Board Selection (Tabs) */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b-2">
            {[...new Set(schoolData.map((item) => item.BOARD))].map((board, index) => {
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
                selectedBoard === board
                  ? `border-b-4 border-black ${colorClass}`
                  : colorClass;

              return (
                <button
                  key={board}
                  className={`px-4 py-2 text-lg font-semibold focus:outline-none rounded-lg ${selectedClass}`}
                  onClick={() => setSelectedBoard(board)}
                >
                  {board} ({boardTotals[board] || 0})
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">Select Location</option>
              {[...new Set(schoolData.map((item) => item.LOCATION))].map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={selectedSubLocation}
              onChange={handleSubLocationChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              disabled={!selectedLocation}
            >
              <option value="">Select Sub Location</option>
              {availableSubLocations.map((subLocation, index) => (
                <option key={index} value={subLocation}>
                  {subLocation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download PDF Button */}
        <div className="mt-4 mb-2 ">
          <button
            onClick={generateCustomFilteredPDF}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Download PDF
          </button>
        </div>

        {/* Display Filtered Data */}
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
              {currentItems.length > 0 ? (
                currentItems.map((data, index) => (
                  <tr key={index} className="text-center">
                    <td className="border border-gray-300 px-4 py-2">{data.SN}</td>
                    <td className="border border-gray-300 px-4 py-2">{data.BOARD}</td>
                    <td className="border border-gray-300 px-4 py-2">{data.LOCATION}</td>
                    <td className="border border-gray-300 px-4 py-2">{data['SUB LOCATION']}</td>
                    <td className="border border-gray-300 px-4 py-2">{data['NAME OF SCHOOL']}</td>
                    <td className="border border-gray-300 px-4 py-2">{data.uid}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handlePreviousPage}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50"
            disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
