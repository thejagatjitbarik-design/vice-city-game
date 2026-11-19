// VICE OUTLAWS - Backend Authentication & OTP Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-Memory Database for Users & OTPs (In production, replace with MongoDB or SQLite)
const users = new Map(); // email -> { email, password, createdAt }
const otpStore = new Map(); // email -> { otp, expiresAt }

// Optional Nodemailer transporter (Configure your SMTP credentials if sending live emails)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Helper: Generate 6-Digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Send / Request OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email, type } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  if (type === 'login' && !users.has(email)) {
    return res.status(404).json({ success: false, message: 'User not registered. Please register first.' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  otpStore.set(email, { otp, expiresAt });

  console.log(`[AUTH] Generated OTP for ${email}: ${otp}`);

  // If live SMTP credentials exist, attempt to send real email
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: `"Vice Outlaws Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Vice Outlaws Access OTP',
        text: `Your Vice Outlaws verification code is: ${otp}. It will expire in 5 minutes.`
      });
    } catch (err) {
      console.warn('Live email dispatch failed, returning simulated OTP', err.message);
    }
  }

  // Return success (also return OTP in response for testing/instant play without SMTP config)
  return res.json({
    success: true,
    message: 'OTP sent successfully!',
    demoOtp: otp // Allows instant testing without needing real SMTP configuration
  });
});

// 2. Register & Verify OTP Endpoint
app.post('/api/register', (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  users.set(email, { email, password, createdAt: new Date() });
  otpStore.delete(email);

  return res.json({
    success: true,
    message: 'Registration successful! Welcome to Vice Outlaws.',
    user: { email }
  });
});

// 3. Login & Verify OTP Endpoint
app.post('/api/login', (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  otpStore.delete(email);
  return res.json({
    success: true,
    message: 'Login verified! Entering Vice City...',
    user: { email }
  });
});

app.listen(PORT, () => {
  console.log(`VICE OUTLAWS Game & Auth Server running at http://localhost:${PORT}`);
});
