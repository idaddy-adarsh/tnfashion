import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Test connection
    const isConnected = await transporter.verify()
    console.log('SMTP Connection:', isConnected)

    if (!isConnected) {
      throw new Error('SMTP connection failed')
    }

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'T&N E-Commerce - Test Email',
      html: `
        <h2>Email Test Successful! 🎉</h2>
        <p>Your email configuration is working correctly.</p>
        <p>You can now use the magic link login feature.</p>
        <br>
        <p><small>Test sent at: ${new Date().toISOString()}</small></p>
      `,
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId,
      accepted: info.accepted,
    })
  } catch (error: any) {
    console.error('Email test error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send email',
        details: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER ? '✓ Set' : '✗ Missing',
          password: process.env.EMAIL_SERVER_PASSWORD ? '✓ Set' : '✗ Missing',
          from: process.env.EMAIL_FROM,
        }
      },
      { status: 500 }
    )
  }
}
