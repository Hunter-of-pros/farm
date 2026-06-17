const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const User = require('../models/User');
const Otp = require('../models/Otp');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'farmfresh_secret_key_change_in_production';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Send OTP code to Email (Registration only, checks username & email uniqueness)
router.post('/send-otp', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and Gmail address are required for registration.' });
  }

  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in.' });
    }

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear previous OTPs for this email
    await Otp.deleteMany({ email });
    
    // Save new OTP
    await Otp.create({ email, otp });

    let isConsoleMode = !resend;

    // Send email via Resend
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'FarmFreshDirect <onboarding@resend.dev>',
          to: email,
          subject: 'Your FarmFreshDirect Verification Code',
          html: `
            <div style="font-family: sans-serif; padding: 25px; max-width: 500px; border: 1px solid #edf5ec; border-radius: 12px; background-color: #f8f9f5;">
              <h2 style="color: #2d5a27; font-family: 'Outfit', sans-serif; margin-bottom: 15px;">Verify Your Email</h2>
              <p style="color: #596a57; font-size: 15px; line-height: 1.5;">Welcome to FarmFreshDirect! Use the verification code below to verify your email and complete registration:</p>
              <div style="background: #ffffff; border: 1px solid rgba(45, 90, 39, 0.12); padding: 15px; font-size: 26px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #1e3d1a; border-radius: 8px; margin: 25px 0; box-shadow: 0 4px 12px rgba(32, 45, 29, 0.03);">
                ${otp}
              </div>
              <p style="color: #596a57; font-size: 13px; line-height: 1.5;">This code is valid for 10 minutes. If you did not make this request, please ignore this message.</p>
            </div>
          `
        });

        if (error) {
          console.error('Failed to send email via Resend API error:', error.message || error);
          logOtpToConsole(email, otp);
          isConsoleMode = true;
        } else {
          console.log(`OTP sent via Resend to ${email} (ID: ${data.id})`);
        }
      } catch (err) {
        console.error('Failed to send email via Resend API exception:', err.message);
        logOtpToConsole(email, otp);
        isConsoleMode = true;
      }
    } else {
      logOtpToConsole(email, otp);
    }

    res.json({ 
      success: true, 
      message: 'Verification code sent.',
      consoleMode: isConsoleMode 
    });
  } catch (err) {
    console.error('Error in send-otp route:', err);
    res.status(500).json({ error: 'Server error generating verification code.' });
  }
});

// Verify OTP code & complete signup registration (saves username & email)
router.post('/verify-otp', async (req, res) => {
  const { username, email, otp, name, password, role } = req.body;
  if (!username || !email || !otp || !name || !password || !role) {
    return res.status(400).json({ error: 'All registration parameters are required.' });
  }

  try {
    // Look up OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    // Verify username/email uniqueness again
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in.' });
    }

    // Validate password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    if (password.length < 8 || 
        !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || 
        !/[0-9]/.test(password) || 
        !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return res.status(400).json({ error: 'Password is too weak. It must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in Mongo DB
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });

    // Clean up OTP codes
    await Otp.deleteMany({ email });

    // Issue signed JWT token
    const token = jwt.sign(
      { userId: user._id || user.id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log(`Registered new user: ${username} (${role})`);

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error in verify-otp route:', err);
    res.status(500).json({ error: 'Server error registering user.' });
  }
});

// Login using username and password
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Find user in Mongo DB by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password credentials.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Email address is not verified.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password credentials.' });
    }

    // Sign JWT token
    const token = jwt.sign(
      { userId: user._id || user.id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// Request Forgot Password reset code
router.post('/forgot-password', async (req, res) => {
  const { identity } = req.body;
  if (!identity) {
    return res.status(400).json({ error: 'Username or Gmail address is required.' });
  }

  try {
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username: identity },
        { email: identity }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'No user found with that Username or Gmail address.' });
    }

    const email = user.email;

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear previous OTPs for this email
    await Otp.deleteMany({ email });
    
    // Save new OTP
    await Otp.create({ email, otp });

    let isConsoleMode = !resend;

    // Send email via Resend
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'FarmFreshDirect <onboarding@resend.dev>',
          to: email,
          subject: 'Your FarmFreshDirect Password Reset Code',
          html: `
            <div style="font-family: sans-serif; padding: 25px; max-width: 500px; border: 1px solid #edf5ec; border-radius: 12px; background-color: #f8f9f5;">
              <h2 style="color: #2d5a27; font-family: 'Outfit', sans-serif; margin-bottom: 15px;">Reset Your Password</h2>
              <p style="color: #596a57; font-size: 15px; line-height: 1.5;">You requested to reset your password on FarmFreshDirect. Use the verification code below to verify your request:</p>
              <div style="background: #ffffff; border: 1px solid rgba(45, 90, 39, 0.12); padding: 15px; font-size: 26px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #1e3d1a; border-radius: 8px; margin: 25px 0; box-shadow: 0 4px 12px rgba(32, 45, 29, 0.03);">
                ${otp}
              </div>
              <p style="color: #596a57; font-size: 13px; line-height: 1.5;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
            </div>
          `
        });

        if (error) {
          console.error('Failed to send password reset email via Resend API error:', error.message || error);
          logOtpToConsole(email, otp);
          isConsoleMode = true;
        } else {
          console.log(`Password reset OTP sent via Resend to ${email} (ID: ${data.id})`);
        }
      } catch (err) {
        console.error('Failed to send password reset email via Resend exception:', err.message);
        logOtpToConsole(email, otp);
        isConsoleMode = true;
      }
    } else {
      logOtpToConsole(email, otp);
    }

    // Return obfuscated email to frontend (e.g. jo**@gmail.com)
    const atIndex = email.indexOf('@');
    const obfuscated = email.substring(0, Math.min(2, atIndex)) + '***' + email.substring(atIndex);

    res.json({ 
      success: true, 
      message: 'Reset verification code dispatched.',
      email: obfuscated,
      fullEmail: email,
      consoleMode: isConsoleMode 
    });
  } catch (err) {
    console.error('Error in forgot-password route:', err);
    res.status(500).json({ error: 'Server error generating reset code.' });
  }
});

// Verify reset OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, verification OTP, and new password are required.' });
  }

  try {
    // Look up OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    // Validate password strength
    if (newPassword.length < 8 || 
        !/[A-Z]/.test(newPassword) || 
        !/[a-z]/.test(newPassword) || 
        !/[0-9]/.test(newPassword) || 
        !/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password is too weak. It must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Clean up OTP
    await Otp.deleteMany({ email });

    console.log(`Reset password for user: ${user.username}`);

    res.json({
      success: true,
      message: 'Your password has been successfully updated.'
    });
  } catch (err) {
    console.error('Error in reset-password route:', err);
    res.status(500).json({ error: 'Server error updating password.' });
  }
});

// Get current user profile (JWT protected)
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Helper for logging OTP to console
function logOtpToConsole(email, otp) {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│             [FARMFRESHDIRECT DEV AUTH LOGGER]          │');
  console.log('├────────────────────────────────────────────────────────┤');
  console.log(`│  To: ${email.padEnd(50)}│`);
  console.log(`│  OTP Code: ${otp.padEnd(44)}│`);
  console.log('│  Note: Configure RESEND_API_KEY to send real emails.   │');
  console.log('└────────────────────────────────────────────────────────┘\n');
}

module.exports = router;
