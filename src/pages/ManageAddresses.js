import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

function ManageAddresses() {
  const [userId] = useState("user123"); // Mock user ID
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addressToUpdate, setAddressToUpdate] = useState(null);
  const [newAddress, setNewAddress] = useState({
    houseNo: "",
    area: "",
    category: "",
    location: null,
  });

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/locations/${userId}`);
      setSavedAddresses(response.data);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return alert("Please enter a search query");
    try {
      const response = await axios.get(`http://localhost:5000/api/search-locations?query=${searchQuery}`);
      setSavedAddresses(response.data);
    } catch (error) {
      console.error('Error searching for addresses:', error);
    }
  };

  const handleSelectAddress = (address) => {
    alert(`Selected address: ${address.houseDetails.houseNo}, ${address.houseDetails.area}`);
  };

  const handleUpdateAddress = (address) => {
    setAddressToUpdate(address);
    setNewAddress({
      houseNo: address.houseDetails.houseNo,
      area: address.houseDetails.area,
      category: address.category,
      location: address.location,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-location/${addressId}`);
      fetchSavedAddresses();
      alert("Address deleted successfully");
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSaveUpdatedAddress = async () => {
    if (!newAddress.houseNo || !newAddress.area || !newAddress.category || !newAddress.location) {
      return alert("Please complete the address details.");
    }
    try {
      await axios.put('http://localhost:5000/api/update-location', {
        userId,
        addressId: addressToUpdate.id,
        updatedAddress: newAddress,
      });
      fetchSavedAddresses();
      alert("Address updated successfully!");
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  return (
    <div>
      <h1>Manage Saved Addresses</h1>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search for an address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Address List */}
      <ul>
        {savedAddresses.map((address) => (
          <li key={address.id}>
            <div>
              <h3>{address.category}</h3>
              <p>{address.houseDetails.houseNo}, {address.houseDetails.area}</p>
              <button onClick={() => handleSelectAddress(address)}>Select for Delivery</button>
              <button onClick={() => handleUpdateAddress(address)}>Update</button>
              <button onClick={() => handleDeleteAddress(address.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Address Update Form */}
      {addressToUpdate && (
        <div>
          <h2>Update Address</h2>
          <input
            type="text"
            value={newAddress.houseNo}
            onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
            placeholder="House/Flat/Block No."
          />
          <input
            type="text"
            value={newAddress.area}
            onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
            placeholder="Apartment/Road/Area"
          />
          <select
            value={newAddress.category}
            onChange={(e) => setNewAddress({ ...newAddress, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Friends & Family">Friends & Family</option>
          </select>
          {/* Add map integration or other logic to update location here */}
          <button onClick={handleSaveUpdatedAddress}>Save Updated Address</button>
        </div>
      )}
    </div>
  );
}

export default ManageAddresses;
