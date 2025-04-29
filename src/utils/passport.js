import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';  // 🔥 ADD this

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("🌟 Google Profile received:", profile);

      const { given_name, family_name, email } = profile._json;

      if (!email) {
        console.error("❌ Email not found in Google profile.");
        return done(new Error("Email not found in Google profile."), null);
      }

      // Insert into "users" table only
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ 
          username: email.split('@')[0],
          email,
          password: 'google_oauth', 
          role_id: 1  // assuming role_id=1 means normal user
        }])
        .select()
        .single();

      if (userError && userError.code !== '23505') {  // 23505 = unique violation (email already exists)
        console.error("❌ Supabase User Insert Error:", userError);
        return done(new Error(userError.message || "Supabase User Insert Error"), null);
      }

      // 🔥 Generate JWT Token
      const token = jwt.sign({
        username: email.split('@')[0],
        email: email,
        role: "user"  // adjust based on your logic
      }, process.env.JWT_SECRET, { expiresIn: '7d' });

      console.log("✅ Successfully generated JWT token for OAuth login.");

      // instead of returning profile, return token
      return done(null, { token });

    } catch (err) {
      console.error("🔥 Passport Strategy Caught Error:", err);
      return done(err, null);
    }
  }
));

// these are fine
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
