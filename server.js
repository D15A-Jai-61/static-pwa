const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;  // Frontend server running on port 3000
const apiPort = 5000;  // API server running on port 5000

// Serve static files (HTML, CSS, JS) from the root directory
app.use(express.static(path.join(__dirname)));  // Serve everything in the current directory

// Middleware to parse JSON body
app.use(bodyParser.json());

// In-memory storage to simulate data persistence
let formDataStorage = [];

// API endpoint to handle syncing form data
app.post('/sync', (req, res) => {
    const formData = req.body;

    // Store the received form data in the in-memory array
    formDataStorage.push(formData);

    console.log('Received form data:', formData);
    console.log('Stored data:', formDataStorage);

    // Respond with a success message
    res.status(200).json({ message: 'Form data synced successfully' });
});

// API endpoint to fetch all stored form data
app.get('/form-data', (req, res) => {
    res.status(200).json(formDataStorage);
});

// Start the API server
app.listen(apiPort, () => {
    console.log(`API server is running on http://localhost:${apiPort}`);
});

// Start the frontend server (Serving static files)
app.listen(port, () => {
    console.log(`Frontend is running on http://localhost:${port}`);
});
