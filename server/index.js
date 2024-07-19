const express = require('express'); // Import the Express module
const mongoose = require('mongoose'); // Import the Mongoose module for MongoDB interaction
const dotenv = require('dotenv'); // Import dotenv to manage environment variables
const passport = require('passport'); // Import Passport for authentication
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Import the Google OAuth strategy
const session = require('express-session'); // Import express-session for session management

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


// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET, // Using session secret from .env
    resave: false,
    saveUninitialized: true
}));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// Configure Passport with Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    // Here I can use the profile info to check if the user is registered in my DB
    return done(null, profile);
}));


// Serialize user into the session
passport.serializeUser(function(obj, done) {
    done(null, obj);
});


// Deserialize user from the session
passport.deserializeUser(function(obj, done){
    done(null, obj);
});


// Define the Google auth routes
app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req,res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// Define a route for the root url that sends a simple response
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

//Start the Express server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

