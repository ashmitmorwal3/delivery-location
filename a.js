const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // Importing UUID for unique IDs

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Mock database for saving locations
let locations = [];

// Save location API
app.post('/api/save-location', (req, res) => {
  const { userId, location, houseDetails, category } = req.body;

  // Validate input data
  if (!userId || !location || !houseDetails || !category) {
    return res.status(400).json({ message: 'Invalid data. Please provide userId, location, houseDetails, and category.' });
  }

  // Generate unique ID for the location
  const locationId = uuidv4();

  // Add the new location with houseDetails, category, and unique ID
  const newLocation = { id: locationId, userId, location, houseDetails, category };
  locations.push(newLocation);
  
  return res.status(200).json({ message: 'Location saved successfully', locationId });
});

// Get locations API
app.get('/api/locations/:userId', (req, res) => {
  const { userId } = req.params;

  // Filter the locations by userId
  const userLocations = locations.filter(loc => loc.userId === userId);

  if (userLocations.length === 0) {
    return res.status(404).json({ message: 'No locations found for this user.' });
  }

  // Return the locations including house details and category
  res.status(200).json(userLocations);
});

// Update location API
app.put('/api/update-location', (req, res) => {
  const { userId, addressId, updatedAddress } = req.body;

  // Find the location by ID
  const location = locations.find(loc => loc.id === addressId && loc.userId === userId);
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }

  // Update the location details
  location.houseDetails = updatedAddress.houseDetails;
  location.category = updatedAddress.category;
  location.location = updatedAddress.location;

  res.status(200).json({ message: 'Location updated successfully' });
});

// Delete location API
app.delete('/api/delete-location/:id', (req, res) => {
  const { id } = req.params;

  // Find and remove the location by ID
  const index = locations.findIndex(loc => loc.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Location not found' });
  }

  // Remove the location
  locations.splice(index, 1);

  res.status(200).json({ message: 'Location deleted successfully' });
});

// Search locations API (optional, if you want to search saved addresses)
app.get('/api/search-locations', (req, res) => {
  const { query } = req.query;
  const result = locations.filter(loc =>
    loc.houseDetails.houseNo.toLowerCase().includes(query.toLowerCase()) ||
    loc.houseDetails.area.toLowerCase().includes(query.toLowerCase())
  );
  res.status(200).json(result);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
