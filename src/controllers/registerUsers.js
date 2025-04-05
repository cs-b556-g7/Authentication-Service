import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const SALT_ROUNDS = 10;

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // ✅ Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ error: 'Database error while checking user' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // ✅ Fetch role_id from roles table
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .maybeSingle();

    if (roleError || !roleData) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ✅ Insert new user
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
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // ✅ Success
    res.status(201).json({
      success: true
    });
    
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
