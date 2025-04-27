import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};
