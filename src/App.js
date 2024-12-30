import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ManageAddresses from './pages/ManageAddresses'; // Import ManageAddresses Component
import './App.css';  // Import the CSS file

// Rest of the code...


// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Component for Handling Map Clicks
function LocationMarker({ setMarker }) {
  useMapEvents({
    click(e) {
      setMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function App() {
  const [marker, setMarker] = useState(null);
  const [userId] = useState("user123"); // Mock user ID
  const [locationPermission, setLocationPermission] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [searchAddress, setSearchAddress] = useState("");
  const [houseDetails, setHouseDetails] = useState({
    houseNo: "",
    area: "",
  });
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission(true),
        () => setLocationPermission(false)
      );
    }
  }, []);

  const enableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarker({ lat: latitude, lng: longitude });
          setShowModal(false);
        },
        () => alert('Unable to retrieve your location')
      );
    }
  };

  const searchManually = async () => {
    if (!searchAddress) return alert('Please enter an address');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      );
      const data = await response.json();
      if (data.length === 0) {
        alert('No results found. Please try another address.');
        return;
      }

      const { lat, lon } = data[0]; // Taking the first result
      setMarker({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error while searching for the address. Please try again.');
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const saveLocation = async () => {
    if (!marker) return alert('Please select a location!');
    if (!houseDetails.houseNo || !houseDetails.area) {
      return alert('Please provide complete address details.');
    }
    if (!category) return alert('Please select a category for the address.');

    try {
      await axios.post('http://localhost:5000/api/save-location', {
        userId,
        location: marker,
        houseDetails,
        category,
      });
      alert('Location saved successfully!');
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <Router>
      <div>
        <h1>Select Your Delivery Location</h1>

        {/* Navigation Links */}
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/manage-addresses">Manage Addresses</Link>
            </li>
          </ul>
        </nav>

        {/* Main Modal for Location Permissions */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Location Permission</h2>
              <p>
                {locationPermission
                  ? "Your location permission is enabled."
                  : "Please enable your location or search manually."}
              </p>
              <div>
                <button onClick={enableLocation}>Enable Location</button>
                <button onClick={() => setShowModal(false)}>Search Manually</button>
              </div>
            </div>
          </div>
        )}

        {/* Google Map Input Field (for searching manually) */}
        {!locationPermission && (
          <div>
            <input
              type="text"
              placeholder="Enter your address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <button onClick={searchManually}>Search</button>
          </div>
        )}

        {/* Address Details Form */}
        <div>
          <h3>Address Details</h3>
          <input
            type="text"
            placeholder="House/Flat/Block No."
            value={houseDetails.houseNo}
            onChange={(e) =>
              setHouseDetails({ ...houseDetails, houseNo: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Apartment/Road/Area"
            value={houseDetails.area}
            onChange={(e) =>
              setHouseDetails({ ...houseDetails, area: e.target.value })
            }
          />
        </div>

        {/* Category Selection */}
        <div>
          <h3>Select Category</h3>
          <button onClick={() => handleCategoryChange('Home')}>Home</button>
          <button onClick={() => handleCategoryChange('Office')}>Office</button>
          <button onClick={() => handleCategoryChange('Friends & Family')}>
            Friends & Family
          </button>
        </div>

        <MapContainer
          center={marker ? [marker.lat, marker.lng] : [37.7749, -122.4194]} // Default center
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          <LocationMarker setMarker={setMarker} />
        </MapContainer>

        <button onClick={saveLocation}>Save Location</button>

        {/* Routing to ManageAddresses page */}
        <Routes>
          <Route path="/manage-addresses" element={<ManageAddresses />} />
          <Route
            path="/"
            element={
              <div>
                <h2>Welcome to the Address Management App</h2>
                <p>Select an option to start managing your addresses.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
