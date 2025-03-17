import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dotenv from "dotenv";
dotenv.config();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; 

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ✅ Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, role_id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Generate JWT Token
    const token = generateToken(user.id);

    // ✅ Set secure cookie (adjust for production)
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: COOKIE_EXPIRY,
    });

    // ✅ Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_id,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
