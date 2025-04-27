import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { sendResetEmail } from '../utils/sendResetEmail.js';
import dotenv from 'dotenv';

dotenv.config();

const RESET_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET || 'another-secret';
const RESET_TOKEN_EXPIRY = parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 900; // 15 mins

export const requestPasswordReset = async (req, res) => {

  console.log("reached fp auth service")
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    const token = jwt.sign({ userId: user.id }, RESET_TOKEN_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendResetEmail(user.email, user.username, resetLink);

    return res.status(200).json({ success: true, message: 'Password reset email sent successfully' });

  } catch (err) {
    console.error('Request Password Reset Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, RESET_TOKEN_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }

    return res.status(200).json({ success: true, message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
