const express = require('express'); // Import the Express module
const mongoose = require('mongoose'); // Import the Mongoose module for MongoDB interaction
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


const app = express(); // Create an Express application
const PORT = process.env.PORT || 5000; // Define the port number, defaulting to 5000 if not specified in environment variables


// Connect to the MongoDB Atlas using connection string from .env file
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Error connecting to MongoDB Atlas', error);
});


// Define a route for the root url that sends a simple response
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

//Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

