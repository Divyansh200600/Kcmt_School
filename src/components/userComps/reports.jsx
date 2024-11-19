import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../utils/firebaseConfig";

export default function Reports() {
  const [regions, setRegions] = useState([]); // List of regions
  const [selectedRegion, setSelectedRegion] = useState(""); // Selected region
  const [loading, setLoading] = useState(true); // Regions loading state

  // Dummy data for the table
  const dummyData = {
    School: {
      CBSE: 5,
      ICSE: 7,
      UPBoard: 10,
      Other: 4,
    },
    College: {
      SomeCollege: 3,
      OtherCollege: 6,
    },
    Coaching: {
      CoachingCenter: 8,
    },
  };

  // Fetch regions from Firestore
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const locationsRef = collection(firestore, "locations");
        const querySnapshot = await getDocs(locationsRef);
        const fetchedRegions = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            fetchedRegions.push(data.name);
          }
        });

        setRegions(fetchedRegions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching regions: ", error);
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Handle region selection
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
     
      <div className="mb-6">
        <label
          htmlFor="region-selector"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Region:
        </label>
        {loading ? (
          <p className="text-gray-500 text-center">Loading regions...</p>
        ) : (
          <select
            id="region-selector"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRegion}
            onChange={handleRegionChange}
          >
            <option value="" disabled>
              -- Select a Region --
            </option>
            {regions.map((region, index) => (
              <option key={index} value={region}>
                {region}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedRegion && (
        <div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Data for {selectedRegion}
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
              <tr>
                <td className="border border-gray-300 px-4 py-2">CBSE</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.School.CBSE}
                </td>
                <td className="border border-gray-300 px-4 py-2">Some College</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.College.SomeCollege}
                </td>
                <td className="border border-gray-300 px-4 py-2">Coaching Center</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.Coaching.CoachingCenter}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">ICSE</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.School.ICSE}
                </td>
                <td className="border border-gray-300 px-4 py-2">Other College</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.College.OtherCollege}
                </td>
                <td className="border border-gray-300 px-4 py-2">Coaching Center</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.Coaching.CoachingCenter}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">UP Board</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.School.UPBoard}
                </td>
                <td className="border border-gray-300 px-4 py-2">Some College</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.College.SomeCollege}
                </td>
                <td className="border border-gray-300 px-4 py-2">Coaching Center</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.Coaching.CoachingCenter}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.School.Other}
                </td>
                <td className="border border-gray-300 px-4 py-2">Other College</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.College.OtherCollege}
                </td>
                <td className="border border-gray-300 px-4 py-2">Coaching Center</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {dummyData.Coaching.CoachingCenter}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
