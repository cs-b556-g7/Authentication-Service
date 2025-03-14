import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set("views", "./src/views"); // Set the views directory

app.use(express.json());

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/login', (req, res) => {
    res.render("login");
});

// Google Auth Route
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Auth Callback
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

app.listen(PORT, () => {
    console.log(`Server is Running on Port ${PORT}`);
});