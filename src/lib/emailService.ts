// Email service using Nodemailer with Gmail
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const APP_NAME = 'VFurniture';
const SENDER_NAME = 'VFurniture Support';

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('⚠️ Email credentials not configured. Email sending will be disabled.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('📧 Email would be sent to:', options.to);
    console.log('Subject:', options.subject);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    console.log('✅ Email sent to:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const getStatusInfo = (status: string): { title: string; message: string } => {
  const statusMap: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being prepared.',
    },
    processing: {
      title: 'Order Processing',
      message: 'Your order is being processed and will be shipped soon.',
    },
    shipped: {
      title: 'Order Shipped',
      message: 'Your order is on its way.',
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully.',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled.',
    },
  };

  return statusMap[status] || {
    title: 'Order Status Updated',
    message: 'Your order status has been updated.',
  };
};

export function getOrderStatusUpdateEmailHTML(order: any, customerName: string): string {
  const statusInfo = getStatusInfo(order.orderStatus);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Update - #${order.orderNumber}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .wrapper { width: 100% !important; }
    .content { max-width: 600px !important; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" class="content" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 30px 40px;">
              <h2 style="margin:0 0 10px 0;font-size:20px;font-weight:bold;color:#000000;">${statusInfo.title}</h2>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Hi ${customerName},</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 40px 30px 40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#333333;">${statusInfo.message}</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 40px 30px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #dddddd;">
                <tr>
                  <td style="padding:15px 20px;border-bottom:1px solid #dddddd;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:13px;color:#666666;width:40%;">Order Number</td>
                        <td align="right" style="font-size:14px;font-weight:bold;color:#000000;">#${order.orderNumber}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:15px 20px;border-bottom:1px solid #dddddd;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:13px;color:#666666;width:40%;">Order Status</td>
                        <td align="right" style="font-size:14px;font-weight:bold;color:#000000;">${statusInfo.title}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:15px 20px;border-bottom:1px solid #dddddd;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:13px;color:#666666;width:40%;">Order Date</td>
                        <td align="right" style="font-size:14px;font-weight:bold;color:#000000;">${formatDate(order.createdAt)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:15px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:13px;color:#666666;width:40%;">Total Amount</td>
                        <td align="right" style="font-size:14px;font-weight:bold;color:#000000;">${formatCurrency(order.totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${order.trackingNumber ? `
          <tr>
            <td style="padding:0 40px 30px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9f9f9;border:1px solid #dddddd;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px 0;font-size:11px;font-weight:bold;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Tracking Number</p>
                    <p style="margin:0;font-size:16px;font-weight:bold;color:#000000;font-family:'Courier New',Courier,monospace;">${order.trackingNumber}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          ${order.expectedDeliveryDate ? `
          <tr>
            <td style="padding:0 40px 30px 40px;">
              <p style="margin:0;font-size:14px;color:#333333;">
                <strong>Expected Delivery:</strong> ${formatDate(order.expectedDeliveryDate)}
              </p>
            </td>
          </tr>
          ` : ''}
          
          <tr>
            <td style="padding:0 40px 40px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#000000;border-radius:0;">
                    <a href="${APP_URL}/order-details/${order.orderNumber}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;" target="_blank">VIEW ORDER DETAILS</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#666666;text-align:center;">Thank you for shopping with ${APP_NAME}</p>
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This is an automated email. Please do not reply.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getVerificationOTPEmailHTML(verificationCode: string, userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME} Seller</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Verify Your Email</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Use this verification code to complete your seller registration:</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 40px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:25px;background-color:#f9f9f9;border:2px dashed #cccccc;text-align:center;">
                    <p style="margin:0;font-size:32px;font-weight:bold;color:#000000;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">${verificationCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:13px;color:#000000;text-align:center;font-weight:bold;">This code expires in 5 minutes</p>
              <p style="margin:10px 0 0 0;font-size:13px;color:#999999;text-align:center;">If you didn't request this, ignore this email.</p>
              <p style="margin:10px 0 0 0;font-size:12px;color:#666666;text-align:center;">This code is securely encrypted and can only be used once.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent to verify your seller registration with ${APP_NAME}.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getResetPasswordEmailHTML(resetCode: string, userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">

          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid:#000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Reset Your Password</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">We received a request to reset your password. Click the button below to create a new password:</p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 40px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#000000;border-radius:0;">
                    <a href="${APP_URL}/reset-password?token=${resetCode}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;" target="_blank">RESET PASSWORD</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent to reset your password for ${APP_NAME} account.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 🔐 Password Reset OTP Email Template
export function getResetPasswordOTPEmailHTML(otpCode: string, userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>🔐 Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">
          
          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid:#dc2626;background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">${APP_NAME} Seller</h1>
              <p style="margin:8px 0 0 0;color:#fecaca;font-size:14px;">Password Reset</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:20px;">🔐</div>
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Reset Your Password</h2>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#666666;">
                We received a request to reset your password. Use the 6-digit code below to proceed:
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 40px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:25px;background-color:#fef2f2;border:2px dashed #dc2626;text-align:center;">
                    <p style="margin:0;font-size:32px;font-weight:bold;color:#dc2626;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">${otpCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:13px;color:#dc2626;text-align:center;font-weight:bold;">⏰ This code expires in 10 minutes</p>
              <p style="margin:10px 0 0 0;font-size:13px;color:#999999;text-align:center;">If you didn't request this, ignore this email.</p>
              <p style="margin:10px 0 0 0;font-size:12px;color:#666666;text-align:center;">🔒 This code is securely encrypted and can only be used once.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:20px 40px;background-color:#f9f9f9;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent to reset your password for ${APP_NAME}.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


export function getWelcomeEmailHTML(userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to ${APP_NAME}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">

          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Welcome to ${APP_NAME}!</h2>
              <p style="margin:0 0 
              15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">Thank you for signing up with us. We're excited to have you on board!</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent to welcome you to ${APP_NAME}.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
export function getContactUsEmailHTML(userName: string, userEmail: string, userMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Contact Us Message</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">

          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME} Contact Us</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 30px 40px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">New Contact Us Message</h2>
              <p style
              ="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>Name:</strong> ${userName}</p>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin:0 0 15px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>Message:</strong></p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">${userMessage}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent from the contact us form on ${APP_NAME}.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getAccountDeletionEmailHTML(userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Account Deletion Confirmation</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #dddddd;">

          <tr>
            <td style="padding:30px 40px;border-bottom:2px solid #000000;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#000000;letter-spacing:-0.5px;">${APP_NAME} Account</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 30px 40px;text-align:center;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#000000;">Account Deletion Confirmation</h2>
              <p style="margin:0 
              0 15px 0;font-size:15px;line-height:1.6;color:#333333;">Hi ${userName},</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">We're sorry to see you go. Your account has been successfully deleted from ${APP_NAME}.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;background-color:#f9f9f9;border-top:1px solid #dddddd;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This email was sent to confirm the deletion of your ${APP_NAME} account.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

