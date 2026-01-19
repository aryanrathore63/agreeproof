const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Using EmailJS (free tier) as primary option
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY
  },
  
  // Using Brevo (Sendinblue) free tier as backup
  brevo: {
    api: require('sib-api-v3-sdk'),
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@agreeproof.com',
    senderName: process.env.BREVO_SENDER_NAME || 'AgreeProof'
  },
  
  // Using Gmail SMTP for development
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  }
};

// Initialize email transporter
let transporter = null;

// Try to initialize with available service
const initializeEmailService = () => {
  try {
    // Try Gmail first (for development)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransporter(emailConfig.gmail);
      console.log('Email service initialized with Gmail SMTP');
      return 'gmail';
    }
    
    // Try Brevo as backup
    if (process.env.BREVO_API_KEY) {
      const defaultClient = emailConfig.brevo.api.ApiClient.instance;
      defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
      console.log('Email service initialized with Brevo API');
      return 'brevo';
    }
    
    console.log('No email service configured - using mock email service');
    return 'mock';
    
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return 'mock';
  }
};

// Email templates
const emailTemplates = {
  agreementReminder: {
    subject: 'Reminder: Agreement Payment Due Soon - AgreeProof',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agreement Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .agreement-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Agreement Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${data.partyBName},</p>
            <p>This is a friendly reminder that you have an agreement payment due soon:</p>
            
            <div class="agreement-details">
              <h3>${data.title}</h3>
              <p><strong>Agreement ID:</strong> ${data.agreementId}</p>
              <p><strong>Amount:</strong> ₹${data.amount}</p>
              <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
              <p><strong>Payment Type:</strong> ${data.paymentType}</p>
              <p><strong>Days Remaining:</strong> ${data.daysRemaining} days</p>
            </div>
            
            <p><strong>Agreement Details:</strong></p>
            <p>${data.content}</p>
            
            <div style="text-align: center;">
              <a href="${data.viewLink}" class="btn">View Agreement</a>
            </div>
            
            <p>Please make the payment before the due date to avoid any delays.</p>
            <p>Best regards,<br>The AgreeProof Team</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from AgreeProof. If you have already made the payment, please ignore this email.</p>
            <p>© 2026 AgreeProof. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  agreementConfirmed: {
    subject: 'Agreement Confirmed - AgreeProof',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agreement Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .agreement-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Agreement Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi ${data.partyBName},</p>
            <p>Great news! Your agreement has been confirmed:</p>
            
            <div class="agreement-details">
              <h3>${data.title}</h3>
              <p><strong>Agreement ID:</strong> ${data.agreementId}</p>
              <p><strong>Confirmed At:</strong> ${new Date(data.confirmedAt).toLocaleString()}</p>
              <p><strong>Amount:</strong> ₹${data.amount}</p>
              <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            </div>
            
            <p><strong>Agreement Details:</strong></p>
            <p>${data.content}</p>
            
            <div style="text-align: center;">
              <a href="${data.viewLink}" class="btn">View Agreement</a>
            </div>
            
            <p>This agreement is now legally binding and timestamped. Please keep this email for your records.</p>
            <p>Best regards,<br>The AgreeProof Team</p>
          </div>
          <div class="footer">
            <p>© 2026 AgreeProof. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  paymentReceived: {
    subject: 'Payment Received - Agreement Marked as Paid - AgreeProof',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .agreement-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Received</h1>
          </div>
          <div class="content">
            <p>Hi ${data.partyBName},</p>
            <p>Thank you! Your payment has been received and the agreement has been marked as paid:</p>
            
            <div class="agreement-details">
              <h3>${data.title}</h3>
              <p><strong>Agreement ID:</strong> ${data.agreementId}</p>
              <p><strong>Payment Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
              <p><strong>Amount:</strong> ₹${data.amount}</p>
              <p><strong>Payment Type:</strong> ${data.paymentType}</p>
              ${data.paymentNotes ? `<p><strong>Notes:</strong> ${data.paymentNotes}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${data.viewLink}" class="btn">View Agreement</a>
            </div>
            
            <p>This agreement is now complete. Thank you for using AgreeProof!</p>
            <p>Best regards,<br>The AgreeProof Team</p>
          </div>
          <div class="footer">
            <p>© 2026 AgreeProof. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Email service class
class EmailService {
  constructor() {
    this.serviceType = initializeEmailService();
  }

  // Send email using configured service
  async sendEmail(to, template, data) {
    try {
      if (this.serviceType === 'mock') {
        console.log('📧 MOCK EMAIL - Service not configured');
        console.log('To:', to);
        console.log('Template:', template);
        console.log('Data:', data);
        return { success: true, message: 'Mock email sent' };
      }

      const templateData = emailTemplates[template];
      if (!templateData) {
        throw new Error(`Email template '${template}' not found`);
      }

      const emailContent = {
        to,
        subject: templateData.subject,
        html: templateData.html(data)
      };

      if (this.serviceType === 'gmail') {
        const result = await transporter.sendMail({
          ...emailContent,
          from: process.env.GMAIL_USER
        });
        console.log('✅ Email sent via Gmail:', result.messageId);
        return { success: true, messageId: result.messageId };
      }

      if (this.serviceType === 'brevo') {
        const apiInstance = new emailConfig.brevo.api.TransactionalEmailsApi();
        const sendSmtpEmail = new emailConfig.brevo.api.SendSmtpEmail();
        
        sendSmtpEmail.subject = emailContent.subject;
        sendSmtpEmail.htmlContent = emailContent.html;
        sendSmtpEmail.sender = {
          email: emailConfig.brevo.senderEmail,
          name: emailConfig.brevo.senderName
        };
        sendSmtpEmail.to = [{ email: to }];
        
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent via Brevo:', result.messageId);
        return { success: true, messageId: result.messageId };
      }

    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  // Send agreement reminder
  async sendAgreementReminder(agreement) {
    const daysRemaining = Math.ceil((new Date(agreement.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    await this.sendEmail(
      agreement.partyB.contact,
      'agreementReminder',
      {
        partyBName: agreement.partyB.name,
        title: agreement.title,
        agreementId: agreement.agreementId,
        amount: agreement.amount,
        dueDate: agreement.dueDate,
        paymentType: agreement.paymentType,
        daysRemaining,
        content: agreement.content,
        viewLink: `${process.env.FRONTEND_URL}/a/${agreement.agreementId}`
      }
    );
  }

  // Send agreement confirmation
  async sendAgreementConfirmation(agreement) {
    await this.sendEmail(
      agreement.partyB.contact,
      'agreementConfirmed',
      {
        partyBName: agreement.partyB.name,
        title: agreement.title,
        agreementId: agreement.agreementId,
        confirmedAt: agreement.confirmedAt,
        amount: agreement.amount,
        dueDate: agreement.dueDate,
        content: agreement.content,
        viewLink: `${process.env.FRONTEND_URL}/a/${agreement.agreementId}`
      }
    );
  }

  // Send payment received notification
  async sendPaymentReceived(agreement) {
    await this.sendEmail(
      agreement.partyB.contact,
      'paymentReceived',
      {
        partyBName: agreement.partyB.name,
        title: agreement.title,
        agreementId: agreement.agreementId,
        paymentDate: agreement.payment.paymentDate,
        amount: agreement.amount,
        paymentType: agreement.paymentType,
        paymentNotes: agreement.payment.paymentNotes,
        viewLink: `${process.env.FRONTEND_URL}/a/${agreement.agreementId}`
      }
    );
  }

  // Test email service
  async testEmail() {
    try {
      await this.sendEmail(
        'test@example.com',
        'agreementReminder',
        {
          partyBName: 'Test User',
          title: 'Test Agreement',
          agreementId: 'TEST-123',
          amount: 1000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          paymentType: 'UPI',
          daysRemaining: 7,
          content: 'This is a test agreement.',
          viewLink: `${process.env.FRONTEND_URL}/a/TEST-123`
        }
      );
      return { success: true, service: this.serviceType };
    } catch (error) {
      return { success: false, error: error.message, service: this.serviceType };
    }
  }
}

// Create and export email service instance
const emailService = new EmailService();

module.exports = {
  emailService,
  emailTemplates,
  emailConfig,
  initializeEmailService
};