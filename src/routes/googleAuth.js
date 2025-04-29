import express from 'express';
import passport from '../utils/passport.js';

const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Updated callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const { token } = req.user; // 🔥 Get token from passport.js (remember, we added it)
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${token}`;

    console.log("✅ Redirecting after Google login to:", redirectUrl);

    return res.redirect(redirectUrl);
  }
);

export default router;
