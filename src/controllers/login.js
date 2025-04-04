import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day

const generateToken = (userId, username, role) => {
  return jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: '24h' });
};

export const login = async (req, res) => {
  try {
    // 1️⃣ Auto-login via token
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const { data: user, error } = await supabase
          .from('users')
          .select('id, username, email, role_id, roles(name)')
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
            role: user.roles.name
          }
        });
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // 2️⃣ Fresh login using email & password
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, role_id, roles(name)')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const newToken = generateToken(user.id, user.username, user.roles.name);

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
        role: user.roles.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
