const nodemailer = require('nodemailer');
const axios = require('axios');

// Create reusable transporter based on email provider
const createTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp'; // 'resend', 'sendgrid', 'smtp'

  // Option 1: Resend (Recommended - No 2FA needed, just API key)
  if (emailProvider === 'resend') {
    // Resend uses their API directly, not nodemailer
    return { provider: 'resend' };
  }

  // Option 2: SendGrid (No 2FA needed)
  if (emailProvider === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Option 3: SMTP (Works with Outlook, Yahoo, custom SMTP - No 2FA needed for most)
  // For Outlook: smtp-mail.outlook.com
  // For Yahoo: smtp.mail.yahoo.com
  // For custom: use EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
  if (emailProvider === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Default: Gmail (requires 2FA + App Password)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send focus drop alert email
async function sendFocusDropAlert(user, previousScore, currentScore, dropAmount) {
  // Check if email notifications are enabled
  if (!user.emailNotifications?.enabled || !user.emailNotifications?.focusDropAlerts) {
    console.log('📧 Email notifications disabled for user:', user.email);
    return;
  }

  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

  // Check required environment variables based on provider
  if (emailProvider === 'resend' && !process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Skipping email notification.');
    return;
  } else if (emailProvider === 'sendgrid' && !process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SENDGRID_API_KEY not configured. Skipping email notification.');
    return;
  } else if (emailProvider === 'smtp' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.warn('⚠️ Email credentials not configured. Skipping email notification.');
    return;
  }

  const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .score-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
            .score { font-size: 48px; font-weight: bold; color: #e74c3c; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Focus Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>We noticed a significant drop in your focus score during your current session.</p>
              
              <div class="score-box">
                <p><strong>Previous Score:</strong> ${previousScore}</p>
                <p><strong>Current Score:</strong> <span class="score">${currentScore}</span></p>
                <p><strong>Drop:</strong> ${dropAmount} points</p>
              </div>

              <p>This might be a good time to:</p>
              <ul>
                <li>Take a short break (3-5 minutes)</li>
                <li>Drink some water</li>
                <li>Do a quick stretch</li>
                <li>Refocus on your current task</li>
              </ul>

              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Return to FocusFlow</a>
            </div>
            <div class="footer">
              <p>You're receiving this because you have focus drop alerts enabled in your FocusFlow settings.</p>
              <p>To manage your email preferences, visit your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile">Profile Settings</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `;

  const emailText = `
        Focus Alert
        
        Hello ${user.name},
        
        We noticed a significant drop in your focus score during your current session.
        
        Previous Score: ${previousScore}
        Current Score: ${currentScore}
        Drop: ${dropAmount} points
        
        This might be a good time to take a short break, drink some water, or refocus on your current task.
        
        Return to FocusFlow: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
        
        You're receiving this because you have focus drop alerts enabled in your FocusFlow settings.
        To manage your email preferences, visit your Profile Settings.
      `;

  const emailSubject = `⚠️ Focus Alert: Your focus score dropped by ${dropAmount} points`;
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@focusflow.app';
  const fromName = 'FocusFlow';

  try {
    const transporter = createTransporter();

    // Option 1: Resend API (Recommended - No 2FA needed)
    if (emailProvider === 'resend') {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: `"${fromName}" <${fromEmail}>`,
          to: [user.email],
          subject: emailSubject,
          html: emailHtml,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('✅ Focus drop alert email sent via Resend:', response.data.id);
      return response.data;
    }

    // Option 2 & 3: SendGrid or SMTP via Nodemailer
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Focus drop alert email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending focus drop alert email:', error);
    throw error;
  }
}

module.exports = {
  sendFocusDropAlert,
};

