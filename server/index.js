const express = require('express'); // Import the Express module
const mongoose = require('mongoose'); // Import the Mongoose module for MongoDB interaction
const dotenv = require('dotenv'); // Import dotenv to manage environment variables
const passport = require('passport'); // Import Passport for authentication
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Import the Google OAuth strategy
const session = require('express-session'); // Import express-session for session management
const crypto = require('crypto'); // Import the built-in crypto module
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const Token = require('./models/Token'); // Import the Token model


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


// Middleware to parse JSON request bodies
app.use(express.json());


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


// Email transport configuration using Brevo SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});



// Route to request login link
app.post('/auth/email', async (req, res) => {
    const email = req.body.email;
    const token = crypto.randomBytes(20).toString('hex');

    // Store token in my database with the email
    await Token.create({email, token, expires: Date.now() + 3600000}); // 1 hour expiration

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Login Link',
        text: `Click the following link to login: http://localhost:5000/auth/email/${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Login link sent!');
    });
});



// Route to verify login link
app.get('/auth/email/:token', async (req, res) => {
    const token = req.params.token;
    const tokenRecord = await Token.findOne({token});

    if (!tokenRecord || tokenRecord.expires < Date.now()) {
        return res.status(400).send('Token is invalid or expired!');
    }

    // Here I would log the user in and create a session
    req.session.user = {email: tokenRecord.email};
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

