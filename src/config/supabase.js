import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Check your .env file.");
  throw new Error('Missing Supabase credentials');
}

console.log("✅ Supabase connected successfully!");

export const supabase = createClient(supabaseUrl, supabaseKey);
