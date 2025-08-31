import nodemailer from 'nodemailer'
import OTP from './models/OTP'
import dbConnect from './mongodb'

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

// Send OTP email
export async function sendOTPEmail(
  email: string, 
  otp: string, 
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const subject = purpose === 'email_verification' 
      ? 'Verify Your Email - T&N' 
      : 'Reset Your Password - T&N'
    
    const html = purpose === 'email_verification' 
      ? getVerificationEmailTemplate(otp)
      : getPasswordResetEmailTemplate(otp)

    const mailOptions = {
      from: `"T&N" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

// Store OTP in database
export async function storeOTP(
  email: string, 
  code: string, 
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<boolean> {
  try {
    await dbConnect()
    
    // Delete any existing unused OTPs for this email and purpose
    await OTP.deleteMany({ 
      email, 
      purpose, 
      isUsed: false 
    })
    
    // Create new OTP
    await OTP.create({
      email,
      code,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
    
    return true
  } catch (error) {
    console.error('Error storing OTP:', error)
    return false
  }
}

// Verify OTP
export async function verifyOTP(
  email: string, 
  code: string, 
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect()
    
    const otpRecord = await OTP.findOne({
      email,
      code,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!otpRecord) {
      return { success: false, error: 'Invalid or expired OTP' }
    }
    
    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true })
    
    return { success: true }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'Failed to verify OTP' }
  }
}

// Email templates
function getVerificationEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - T&N</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo h1 {
          font-size: 32px;
          font-weight: 800;
          color: #000;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .otp-code {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          margin: 24px 0;
          color: #000;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <h1>T&N</h1>
          </div>
          
          <h2 style="text-align: center; margin-bottom: 16px;">Verify Your Email</h2>
          
          <p>Welcome to T&N! Please verify your email address by entering the following code:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p style="text-align: center; color: #6c757d; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          
          <div class="footer">
            <p>If you didn't create an account with T&N, please ignore this email.</p>
            <p>&copy; 2025 T&N. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function getPasswordResetEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - T&N</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo h1 {
          font-size: 32px;
          font-weight: 800;
          color: #000;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .otp-code {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          margin: 24px 0;
          color: #000;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <h1>T&N</h1>
          </div>
          
          <h2 style="text-align: center; margin-bottom: 16px;">Reset Your Password</h2>
          
          <p>You requested to reset your password. Please use the following code:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p style="text-align: center; color: #6c757d; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>&copy; 2025 T&N. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
