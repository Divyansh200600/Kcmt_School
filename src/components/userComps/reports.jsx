import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../utils/firebaseConfig";

export default function Reports() {
  const [locations, setLocations] = useState([]); // List of locations
  const [subLocations, setSubLocations] = useState([]); // List of sub-locations
  const [boards, setBoards] = useState([]); // List of board types
  const [selectedLocation, setSelectedLocation] = useState(""); // Selected location
  const [selectedSubLocation, setSelectedSubLocation] = useState(""); // Selected sub-location
  const [loading, setLoading] = useState(true); // Loading state
  const [data, setData] = useState({}); // Data for the selected location and sub-location

  // Fetch all unique locations from Firestore
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const schoolDataRef = collection(firestore, "schoolData");
        const querySnapshot = await getDocs(schoolDataRef);
        const fetchedLocations = new Set();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.LOCATION) {
            fetchedLocations.add(data.LOCATION);
          }
        });

        setLocations(Array.from(fetchedLocations));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching locations: ", error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch sub-locations based on selected location
  useEffect(() => {
    const fetchSubLocations = async () => {
      if (!selectedLocation) return; // Don't fetch if no location selected

      setLoading(true);
      try {
        const schoolDataRef = collection(firestore, "schoolData");
        const locationQuery = query(schoolDataRef, where("LOCATION", "==", selectedLocation));
        const querySnapshot = await getDocs(locationQuery);

        const fetchedSubLocations = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data["SUB LOCATION"]) {
            fetchedSubLocations.add(data["SUB LOCATION"]);
          }
        });

        setSubLocations(Array.from(fetchedSubLocations));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sub-locations: ", error);
        setLoading(false);
      }
    };

    fetchSubLocations();
  }, [selectedLocation]);

  // Fetch distinct board types from Firestore
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const schoolDataRef = collection(firestore, "schoolData");
        const querySnapshot = await getDocs(schoolDataRef);

        const fetchedBoards = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.BOARD) {
            fetchedBoards.add(data.BOARD);
          }
        });

        setBoards(Array.from(fetchedBoards));
      } catch (error) {
        console.error("Error fetching boards: ", error);
      }
    };

    fetchBoards();
  }, []);

  // Fetch data based on location and sub-location
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLocation) return; // Don't fetch if no location selected

      setLoading(true);
      try {
        const schoolDataRef = collection(firestore, "schoolData");
        let locationQuery;

        // If sub-location is selected, filter by both location and sub-location
        if (selectedSubLocation) {
          locationQuery = query(
            schoolDataRef,
            where("LOCATION", "==", selectedLocation),
            where("SUB LOCATION", "==", selectedSubLocation)
          );
        } else {
          locationQuery = query(schoolDataRef, where("LOCATION", "==", selectedLocation));
        }

        const querySnapshot = await getDocs(locationQuery);

        // Initialize counts for each board type
        let boardCounts = {};
        boards.forEach((board) => {
          boardCounts[board] = 0;
        });

        // Count documents by BOARD
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const board = data.BOARD;
          if (boardCounts[board] !== undefined) {
            boardCounts[board]++;
          }
        });

        setData(boardCounts); // Set the data state to the counts
        setLoading(false);
      } catch (error) {
        console.error("Error fetching school data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation, selectedSubLocation, boards]);

  // Handle location selection
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
    setSelectedSubLocation(""); // Reset sub-location when location changes
  };

  // Handle sub-location selection
  const handleSubLocationChange = (event) => {
    setSelectedSubLocation(event.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold">School Information Report:</h1>

      {/* Location Selector */}
      <div className="mb-6">
        <label htmlFor="location-selector" className="block text-gray-700 font-medium mb-2">
          Select Location:
        </label>
        {loading ? (
          <p className="text-gray-500 text-center">Loading locations...</p>
        ) : (
          <select
            id="location-selector"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedLocation}
            onChange={handleLocationChange}
          >
            <option value="" disabled>
              -- Select a Location --
            </option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sub-location Selector */}
      {selectedLocation && (
        <div className="mb-6">
          <label htmlFor="sub-location-selector" className="block text-gray-700 font-medium mb-2">
            Select Sub Location:
          </label>
          {loading ? (
            <p className="text-gray-500 text-center">Loading sub-locations...</p>
          ) : (
            <select
              id="sub-location-selector"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubLocation}
              onChange={handleSubLocationChange}
            >
              <option value="" disabled>
                -- Select a Sub Location --
              </option>
              {subLocations.map((subLocation, index) => (
                <option key={index} value={subLocation}>
                  {subLocation}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Board Counts Table */}
      {selectedLocation && (
        <div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Data for {selectedLocation} {selectedSubLocation && ` - ${selectedSubLocation}`}
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">School</th>
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">College</th>
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">Coaching</th>
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">All State Board</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((boardType) => (
                <tr key={boardType}>
                  <td className="border border-gray-300 px-4 py-2">{boardType}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {data[boardType] || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">Some College</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">3</td>
                  <td className="border border-gray-300 px-4 py-2">Coaching Center</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                  <td className="border border-gray-300 px-4 py-2">All Boards</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
