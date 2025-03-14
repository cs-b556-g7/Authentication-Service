import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
// Import required modules 
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import GoogleStrategy from 'passport-google-oauth20';

dotenv.config({ path: './path/to/.env' });
// require('dotenv').config();

// const express = require('express');
// const passport = require('passport');
// const session = require('express-session');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

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

// Define routes
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get(
  '/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  res.send('Welcome ${req.user.displayName}');
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});