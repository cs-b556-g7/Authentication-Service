import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; 

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const login = async (req, res) => {
  try {
    // 1️⃣ **Check if a token is already provided in headers**
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch user from DB using decoded ID
        const { data: user, error } = await supabase
          .from('users')
          .select('id, username, email, role_id')
          .eq('id', decoded.userId)
          .single();
          
        if (error || !user) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        return res.status(200).json({
          message: 'Auto-login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role_id,
          },
        });
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // 2️⃣ **If no token, check email & password**
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Fetch user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, role_id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a new token
    const newToken = generateToken(user.id);

    res.cookie('authToken', newToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: COOKIE_EXPIRY,
    });

    res.status(200).json({
      message: 'Login successful',
      token: newToken,
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
