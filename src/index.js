import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 🛠 Load environment variables first (very important)
dotenv.config();

import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './utils/passport.js';  // Safe now - env loaded
import authRoutes from './routes/authRoutes.js';
import loginRoute from './routes/login.js';  
import googleAuthRoutes from './routes/googleAuth.js';

const app = express();
const PORT = process.env.PORT || 5001;  // Use 5001 (your backend port)

app.get("/", (req, res) => {
  res.status(200).send("Auth Service is alive");
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🛠 Setup session before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 🛠 Setup passport
app.use(passport.initialize());
app.use(passport.session());

// 🛠 Setup routes
app.use('/', googleAuthRoutes);
app.use('/', authRoutes);
app.use('/', loginRoute);

// 🛠 Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 🛠 Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
