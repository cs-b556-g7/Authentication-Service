import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
import { Client as DuoClient } from '@duosecurity/duo_universal';
import { verifyCaptcha } from '../utils/verifyCaptcha.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day

const duo = new DuoClient({
  clientId: process.env.DUO_CLIENT_ID,
  clientSecret: process.env.DUO_CLIENT_SECRET,
  apiHost: process.env.DUO_API_HOST,
  redirectUrl: process.env.DUO_REDIRECT_URI,
});

const generateToken = (userId, username, role) => {
  return jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: '24h' });
};

export const login = async (req, res) => {
  try {
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
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        return res.status(200).json({
          success: true,
          message: 'Auto-login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.roles.name,
          }
        });
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
    }

    const { email, password, role, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ success: false, message: 'CAPTCHA token is required' });
    }

    const isHuman = await verifyCaptcha(captchaToken);
    if (!isHuman) {
      return res.status(403).json({ success: false, message: 'CAPTCHA verification failed' });
    }

    if (!email || !password || typeof role !== 'string' || !['user', 'venue_owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Email, password, and valid role are required' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, role_id, roles(name)')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.roles.name !== role) {
      return res.status(403).json({ success: false, message: `Role mismatch. Please login as ${user.roles.name}` });
    }

    const state = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });
    const authUrl = await duo.createAuthUrl(user.username, state);
    return res.status(200).json({
      success: true,
      requires2FA: true,
      authUrl,
      state,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyDuo = async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ success: false, message: 'Missing Duo code or state' });
    }

    const decoded = jwt.verify(state, JWT_SECRET);
    const email = decoded.email;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role_id, roles(name)')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found after Duo verification' });
    }

    const duoToken = await duo.exchangeAuthorizationCodeFor2FAResult(code, user.username);

    if (!duoToken.auth_result || duoToken.auth_result.status !== 'allow') {
      return res.status(401).json({ success: false, message: 'Duo authentication failed' });
    }

    const token = generateToken(user.id, user.username, user.roles.name);

    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: COOKIE_EXPIRY,
    });

    return res.status(200).json({
      success: true,
      message: '2FA login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.roles.name,
      }
    });

  } catch (error) {
    console.error('Duo verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during 2FA' });
  }
};

export const duoRedirectHandler = (req, res) => {
  const { duo_code, state } = req.query;
  if (!duo_code || !state) {
    return res.status(400).send('Missing Duo code or state');
  }

  res.redirect(`https://blue-rock-0d2af4e10.6.azurestaticapps.net/duo/callback?duo_code=${duo_code}&state=${state}`);
};