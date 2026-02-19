# Email-Based Password Reset Setup Guide

## Overview
The password reset flow now sends reset tokens via email instead of displaying them in the UI. This guide helps you set up and test the email delivery system.

## Setup Steps

### 1. Get Gmail App Password (or use your SMTP provider)

**For Gmail:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character app password
4. Copy this password (remove spaces)

**For Other Email Providers:**
- Use your email provider's SMTP credentials
- Common providers: Outlook, SendGrid, Mailgun, AWS SES

### 2. Create `.env` File in Backend Directory

Create a file `backend/.env` with the following content:

```
# Gmail Configuration (Example)
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Or use custom SMTP (Example - Outlook)
# SMTP_SERVICE=hotmail
# SMTP_USER=your-email@outlook.com
# SMTP_PASS=your-password

# For custom SMTP (without preset service):
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASS=password
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

This installs the nodemailer package needed for email delivery.

### 4. Start the Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see console output indicating the server is running on port 3000.

---

## Testing the Password Reset Flow

### Test Scenario 1: Complete Reset Flow

1. **Register a new account:**
   - Open `Front.html` in browser
   - Click "Daftar" (Register)
   - Create account with:
     - Username: `testuser`
     - Email: `your-email@gmail.com` (your actual email)
     - Password: `TestPassword123`
   - Submit

2. **Trigger password reset:**
   - Click "Lupa password?" link in login modal
   - Enter the email address you registered with
   - Click "Kirim Link Reset"
   - You should see: `✓ Link reset telah dikirim ke email Anda`

3. **Check your email:**
   - Wait 10-30 seconds for email to arrive
   - Check inbox (and spam folder)
   - Look for email subject: "KANS - Password Reset Request"
   - Email contains:
     - Reset token (64-character hex code)
     - Click link: `http://localhost:3000/?reset_token=<token>`

4. **Reset the password:**
   - Copy the reset token from email
   - Modal will ask you to paste the token
   - Enter token in "Kode Reset" field
   - Enter new password: `NewPassword456`
   - Confirm password: `NewPassword456`
   - Click "Reset Password"
   - You should see: `✓ Password berhasil direset`

5. **Verify login with new password:**
   - Login with:
     - Username: `testuser`
     - Password: `NewPassword456`
   - Login should succeed

### Test Scenario 2: Invalid Token

1. Trigger forgot-password with your registered email
2. Wait for email and copy the token
3. Try to reset password with:
   - **Wrong token:** Random characters instead of the one from email
   - Expected result: `Gagal mereset password` (Token invalid or expired)
4. Try again with correct token from email
   - Should succeed

### Test Scenario 3: Expired Token

1. Trigger forgot-password
2. Wait 1 hour (or modify backend code to use shorter expiry for testing)
3. Try to reset with old token
4. Expected: `Gagal mereset password` (Token expired)

---

## Backend Configuration Details

### Nodemailer Configuration (server.js)

The transporter is configured to use environment variables:

```javascript
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
```

### Email Template

Users receive an HTML email with:
- Friendly greeting
- Reset token code (to manually copy-paste)
- Direct reset link with token embedded in URL
- Email footer with KANS branding

### Token Details

- **Format:** 64-character hexadecimal string (very secure)
- **Generated using:** `crypto.randomBytes(32).toString('hex')`
- **Expiration:** 1 hour after generation
- **Storage:** Reset token and expiration timestamp stored in SQLite `users` table

---

## Troubleshooting

### Email Not Arriving

**Gmail:**
- Verify SMTP_PASS is the 16-character app password (not your regular password)
- Check spam folder and mark as "Not Spam"
- Verify Gmail account has 2FA enabled (required for app passwords)
- Check that "Less Secure Apps" is OFF (incompatible with app passwords)

**Other Providers:**
- Verify SMTP credentials are correct
- Check if SMTP port is correct (usually 587 for TLS, 465 for SSL)
- Verify email account allows SMTP connections

**Backend:**
- Check server console for email sending errors
- Verify `.env` file is in `backend/` directory and readable
- Check that `nodemailer` is installed: `npm list nodemailer`
- Restart backend after changing `.env` file

### Token Validation Errors

- **"Token invalid or expired":** Token doesn't match database or more than 1 hour old
- **"User not found":** Email address registered with different email than reset
- **"Password doesn't meet requirements":** 
  - Must be 8+ characters
  - Must have uppercase, lowercase, and number
  - Example valid: `NewPass123`

### Button Stays Disabled

- Backend server not responding (check if running)
- Network error (check browser console for fetch errors)
- CORS issue (verify backend has CORS enabled)

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_SERVICE` | Email service name | `gmail`, `hotmail`, `yahoo` |
| `SMTP_USER` | Email address to send from | `your@gmail.com` |
| `SMTP_PASS` | Email service password | `16-char app password` |
| `SMTP_HOST` | Custom SMTP server hostname | `smtp.example.com` |
| `SMTP_PORT` | Custom SMTP server port | `587` |

---

## Production Deployment Checklist

- [ ] Use environment variables (never hardcode credentials)
- [ ] Use app-specific passwords (Gmail) or dedicated SMTP accounts
- [ ] Enable rate limiting on `/api/forgot-password` endpoint (prevent email spam)
- [ ] Add email verification flow (optional enhancement)
- [ ] Monitor email delivery failures and log them
- [ ] Set up HTTPS in production (required for secure token transmission)
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Test with real email addresses before production

---

## Quick Reference: Gmail Setup

```
1. Visit: https://myaccount.google.com/apppasswords
2. Account: your@gmail.com
3. Select: Mail (Outlook, Thunderbird, etc.)
4. Device: Windows Computer
5. Google generates: xxxx xxxx xxxx xxxx (16 characters)
6. Copy: xxxxxxxxxxxxxxxx (without spaces)
7. In .env: SMTP_PASS=xxxxxxxxxxxxxxxx
```

## Quick Reference: Custom SMTP

```
Example: Mailgun SMTP
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASS=your-mailgun-password
```

---

## Testing Without Real Email

**Option 1: Use Mailtrap (Free Service)**
- Sign up at https://mailtrap.io/
- Use SMTP credentials provided by Mailtrap
- Set in `.env` file
- View emails in Mailtrap dashboard instead of real inbox

**Option 2: Use Ethereal Email (No Signup)**
- Add this to backend (temporary testing only):
```javascript
// Generate test account
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass
    }
});
```
- Emails get preview URL in console instead of sending

---

## Support

If you encounter issues:

1. Check browser console (F12 → Console tab) for frontend errors
2. Check backend console for server errors
3. Verify `.env` file exists and has correct values
4. Verify `nodemailer` dependency installed
5. Try sending a test email from command line first (verify SMTP works)

For more help, check:
- Nodemailer docs: https://nodemailer.com/
- SMTP provider documentation
- Backend error logs in server console
