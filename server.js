// VICE OUTLAWS - Backend Authentication & Real Email OTP Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-Memory Database for Users & OTPs
const users = new Map();
const otpStore = new Map();

// Helper: Generate 6-Digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer Transporter Setup
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Production Gmail or Custom SMTP
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim()
    }
  });
  console.log(`[EMAIL] Configured live Gmail SMTP with account: ${process.env.SMTP_USER}`);
} else {
  console.log('[EMAIL] Live SMTP credentials not set yet. Creating auto Ethereal test account...');
  nodemailer.createTestAccount((err, account) => {
    if (!err && account) {
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      console.log(`[EMAIL] Auto-test SMTP created. Test inbox web preview enabled.`);
    }
  });
}

// 1. Send / Request OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email, type } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  // Use client-requested OTP or generate fresh 6-digit OTP
  const otp = req.body.otp || generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  otpStore.set(email, { otp, expiresAt });

  console.log(`\n=============================================`);
  console.log(`[VICE OUTLAWS SECURITY] OTP Generated: ${otp} for ${email}`);
  console.log(`=============================================\n`);

  let emailSent = false;
  let testPreviewUrl = null;

  // Attempt real email dispatch
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Vice Outlaws Security" <${process.env.SMTP_USER || 'no-reply@viceoutlaws.com'}>`,
        to: email,
        subject: 'Your Vice Outlaws Access Code',
        html: `
          <div style="font-family: Arial, sans-serif; background:#0d0614; color:#fff; padding:30px; border-radius:10px; max-width:500px; border:2px solid #ff007f;">
            <h1 style="color:#ff007f; margin-bottom:5px;">VICE OUTLAWS</h1>
            <p style="color:#00f0ff; font-size:12px; letter-spacing:2px; margin-top:0;">UNDERWORLD ACCESS VERIFICATION</p>
            <p style="font-size:14px; margin:20px 0;">Use the 6-digit security code below to verify your account and enter Vice City:</p>
            <div style="background:#150926; border:2px solid #00f0ff; padding:15px; border-radius:8px; text-align:center; font-size:32px; font-weight:900; letter-spacing:8px; color:#ffd700;">
              ${otp}
            </div>
            <p style="font-size:11px; color:#aaa; margin-top:20px;">This code will expire in 5 minutes. If you did not request this code, ignore this email.</p>
          </div>
        `
      });

      emailSent = true;
      testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`[TEST INBOX] View received email online: ${testPreviewUrl}`);
      }
    } catch (err) {
      console.warn('[EMAIL] Dispatch notice:', err.message);
    }
  }

  return res.json({
    success: true,
    message: emailSent
      ? `Verification code dispatched to ${email}! Check your inbox.`
      : `OTP generated for ${email}!`,
    emailSent,
    testPreviewUrl,
    demoOtp: otp // Always guarantees developer/tester can access even without SMTP config
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
