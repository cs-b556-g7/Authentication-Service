import dotenv from 'dotenv';
// Import required modules 
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import GoogleStrategy from 'passport-google-oauth20';

// Load environment variables from .env file
dotenv.config();
dotenv.config({ path: './path/to/.env' });

const app = express();

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure the Google strategy for use by Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback" // Corrected URL
}, (accessToken, refreshToken, profile, done) => {
  // Here you would typically save the user to your database
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to serve static files and parse request bodies
app.set('views', './src/views');
app.set('view engine', 'ejs'); // Set view engine to EJS (optional, if you want to render views)
// app.use(express.json()); // Middleware to parse JSON bodies
// app,use(cookieParser()); 

// Define routes
app.get('/', (req, res) => {
  res.send('WELCOME TO THE HOME PAGE!');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get(
  '/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

import { createClient } from '@supabase/supabase-js'; // Import Supabase client

// Initializing
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
  try {
    // Extract information
    const { id, displayName, emails } = req.user;
    const email = emails && emails[0]?.value;

    // subpase API part
    const { error } = await supabase
      .from('users')
      .upsert({
        username: displayName,
        email,
        password: id, // Store Google OAuth ID in the password column
      }, { onConflict: 'email' }); // columns dones't exist in supabase

    if (error) {
      console.error('Error inserting user into Supabase:', error);
    }

    console.log('User added to Supabase:', email);

    res.redirect('http://localhost:5173/dashboard');
  } catch (err) {
    console.error('Error during Google OAuth callback:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.user) {
      return res.redirect('/login'); // Redirect to login if user is not authenticated
  }
  res.render('dashboard', { user: req.user }); // Pass user data to the view
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});