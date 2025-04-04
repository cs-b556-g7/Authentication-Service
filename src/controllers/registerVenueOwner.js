import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const SALT_ROUNDS = 10;

 export const registerVenueOwner = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please enter all details' });
    }

    // Check if venue owner already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (checkError || existingUser) {
      return res.status(400).json({ error: 'Venue owner already exists or check failed' });
    }

    // Fetch role_id for 'venue_owner'
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'venue_owner')
      .maybeSingle();

    if (roleError || !roleData) {
      return res.status(400).json({ error: 'Role not found' });
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
      return res.status(500).json({ error: 'Could not register venue owner' });
    }

    res.status(201).json({
      message: 'Venue Owner registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'venue_owner'
      }
    });

  } catch (err) {
    console.error('Venue Owner Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

