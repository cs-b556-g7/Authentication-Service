import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { verifyCaptcha } from '../utils/verifyCaptcha.js';

const SALT_ROUNDS = 10;


export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ success: false, message: 'CAPTCHA token is required' });
    }

    const isHuman = await verifyCaptcha(captchaToken);
    if (!isHuman) {
      return res.status(403).json({ success: false, message: 'CAPTCHA verification failed' });
    }

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ success: false, message: 'Database error while checking user' });
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .maybeSingle();

    if (roleError || !roleData) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          role_id: roleData.id
        }
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.log("insert error: ", insertError)
      return res.status(500).json({ success: false, message: 'Failed to register user' });
    }

    // ✅ Success response with user (no password)
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role
      }
    });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
