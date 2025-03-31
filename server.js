// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// In-memory storage to simulate data persistence
let formDataStorage = [];

app.use(bodyParser.json()); // To handle JSON payloads

// Endpoint to handle syncing form data
app.post('/sync', (req, res) => {
    const formData = req.body;

    // Store the received form data in the in-memory array
    formDataStorage.push(formData);

    console.log('Received form data:', formData);
    console.log('Stored data:', formDataStorage);

    // Respond with a success message
    res.status(200).json({ message: 'Form data synced successfully' });
});

// Endpoint to fetch all stored form data
app.get('/form-data', (req, res) => {
    // Send the stored form data back to the client
    res.status(200).json(formDataStorage);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
