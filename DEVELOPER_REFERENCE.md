# Developer Reference Card - Email Password Reset

## Quick Setup

```bash
# 1. Create backend/.env
SMTP_SERVICE=gmail
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# 2. Install and run
cd backend
npm install
npm start

# 3. Test in browser
# Open Front.html
# Register → Logout → Lupa password? → Enter email → Check email → Reset → Login
```

---

## Code Locations

| What | File | Lines |
|------|------|-------|
| Forgot password handler | script.js | 439-473 |
| Reset password handler | script.js | 479-524 |
| Forgot modal HTML | Front.html | 151-166 |
| Reset modal HTML | Front.html | 168-189 |
| Forgot password endpoint | server.js | 165-195 |
| Reset password endpoint | server.js | 196-220 |
| Nodemailer config | server.js | 1-30 |

---

## API Reference

### POST /api/forgot-password
```javascript
// Request
fetch('http://localhost:3000/api/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})

// Response Success
{ success: true, message: 'Reset email sent' }

// Response Error
{ success: false, message: 'Email tidak terdaftar' }
```

### POST /api/reset-password
```javascript
// Request
fetch('http://localhost:3000/api/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: '64-character-hex-token',
    new_password: 'NewPassword123'
  })
})

// Response Success
{ success: true, message: 'Password berhasil direset...' }

// Response Error
{ success: false, message: 'Token tidak valid atau kadaluarsa' }
```

---

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token TEXT,                    -- 64-char hex, NULL when not resetting
  reset_token_expires INTEGER,         -- millisecond epoch, NULL when not resetting
  created_at TEXT NOT NULL
);
```

---

## Password Validation Rules

```javascript
function validatePasswordStrength(password) {
  // Must be 8+ characters
  if (password.length < 8) return { ok: false, msg: 'Min 8 karakter' };
  
  // Must have uppercase
  if (!/[A-Z]/.test(password)) return { ok: false, msg: 'Perlu huruf besar' };
  
  // Must have lowercase
  if (!/[a-z]/.test(password)) return { ok: false, msg: 'Perlu huruf kecil' };
  
  // Must have number
  if (!/[0-9]/.test(password)) return { ok: false, msg: 'Perlu angka' };
  
  return { ok: true };
}

// Valid examples:
// ✓ Password123
// ✓ MySecret456
// ✓ Kans@2024

// Invalid examples:
// ✗ password123 (no uppercase)
// ✗ PASSWORD123 (no lowercase)
// ✗ Password (no number)
// ✗ Pass1 (too short)
```

---

## Token Generation

```javascript
// Secure token generation (backend)
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');

// Result: 64-character hexadecimal string
// Example: a3f2b1c8d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9

// Token expires after 1 hour
const expiration = Date.now() + (60 * 60 * 1000);

// Store in database
db.prepare(
  'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?'
).run(token, expiration, email);
```

---

## Email Template

```html
<!-- Email sent to user -->
<html>
  <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
    <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
      
      <h2>KANS - Password Reset Request</h2>
      
      <p>Hi User,</p>
      <p>We received a request to reset your password. Here's your reset code:</p>
      
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; font-family: monospace; text-align: center;">
        <strong>a3f2b1c8d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9</strong>
      </div>
      
      <p>Or click here to reset: <a href="http://yourapp.com/?reset_token=a3f2b1c8...">Reset Password</a></p>
      
      <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
      
      <p>If you didn't request this, ignore this email.</p>
      
      <p>— KANS Team</p>
    </div>
  </body>
</html>
```

---

## Authentication UI

Authentication (login/register/reset) now lives in the dedicated `login.html` page instead of in-page modal overlays. See `login.html` for the current IDs and structure used by the client-side auth flow.

---

## Form Input IDs (HTML)

```html
<!-- Forgot Password Form -->
<input id="forgot-email" type="email" placeholder="Email">
<div id="forgot-status"></div>
<button id="forgot-submit">Kirim Link Reset</button>

<!-- Reset Password Form -->
<input id="reset-token" type="text" placeholder="Kode reset dari email">
<input id="reset-new-password" type="password" placeholder="Password Baru">
<input id="reset-confirm-password" type="password" placeholder="Konfirmasi Password">
<div id="reset-status"></div>
<button id="reset-submit">Reset Password</button>
```

---

## Status Messages

```javascript
// Blue - Processing
statusEl.style.background = '#e3f2fd';
statusEl.style.color = '#1976d2';
statusEl.textContent = 'Mengirim...';

// Green - Success
statusEl.style.background = '#e8f5e9';
statusEl.style.color = '#388e3c';
statusEl.textContent = '✓ Link reset telah dikirim...';

// Red - Error
statusEl.style.background = '#ffebee';
statusEl.style.color = '#c62828';
statusEl.textContent = 'Gagal mengirim reset link';
```

---

## Debugging Checklist

- [ ] Check `.env` file in `backend/` folder
- [ ] Verify SMTP_SERVICE and SMTP_USER are correct
- [ ] Verify SMTP_PASS is the 16-character app password (not regular password)
- [ ] Restart backend after changing `.env`
- [ ] Check backend console for email errors
- [ ] Check browser console (F12) for fetch errors
- [ ] Verify email inbox (and spam folder)
- [ ] Check that token is copied completely (64 characters)
- [ ] Verify password meets strength requirements

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Email tidak terdaftar" | Email not in database | Register with that email first |
| "Token tidak valid" | Wrong token or expired | Use correct token from email, within 1 hour |
| "Password minimal 8 karakter" | Password too short | Use 8+ characters |
| "Perlu huruf besar" | No uppercase letters | Add A-Z to password |
| "Perlu huruf kecil" | No lowercase letters | Add a-z to password |
| "Perlu angka" | No numbers | Add 0-9 to password |
| "Password tidak cocok" | Passwords don't match | Confirm password exactly matches |
| "Backend not responding" | Server not running | Run `npm start` in backend folder |

---

## Testing Endpoints (curl)

```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@gmail.com","password":"Test123"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123"}'

# Forgot password
curl -X POST http://localhost:3000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'

# Reset password
curl -X POST http://localhost:3000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"64-char-token","new_password":"NewTest456"}'

# Get profile (requires token)
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Environment Variables (.env)

```bash
# Gmail (Recommended)
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # 16-char app password

# Outlook
SMTP_SERVICE=hotmail
SMTP_USER=your@outlook.com
SMTP_PASS=password

# Custom SMTP
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASS=company-password
```

---

## Nodemailer Configuration

```javascript
const nodemailer = require('nodemailer');

// From environment variables
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Or custom SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,  // use TLS (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email
await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: email,
  subject: 'KANS - Password Reset Request',
  html: htmlContent
});
```

---

## Security Best Practices

✅ **DO**
- Use crypto.randomBytes for tokens
- Hash passwords with bcryptjs
- Store credentials in .env file
- Set token expiration (1 hour)
- Clear token after use
- Validate password strength
- Verify email exists before sending
- Log errors server-side

❌ **DON'T**
- Use Math.random for tokens
- Store plain-text passwords
- Hardcode SMTP credentials
- Allow unlimited token lifetime
- Reuse tokens
- Accept weak passwords
- Send password in email
- Expose errors to user (security through obscurity)

---

## Performance Tips

- Cache user lookup if doing many resets
- Use connection pooling for database
- Implement rate limiting (3 resets per hour per email)
- Queue emails asynchronously if needed
- Monitor email delivery success rate

---

## Files Summary

| File | Purpose | Key Changes |
|------|---------|-------------|
| Front.html | UI | Added forgot/reset modals |
| script.js | Logic | Added form handlers with status feedback |
| server.js | Backend | Added email sending, token generation |
| package.json | Dependencies | Added nodemailer |
| .env | Config | SMTP credentials (user creates) |

---

## Useful Links

- Gmail App Passwords: https://myaccount.google.com/apppasswords
- Nodemailer Docs: https://nodemailer.com/
- Bcryptjs Docs: https://github.com/dcodeIO/bcrypt.js
- Better-sqlite3: https://github.com/WiseLibs/better-sqlite3

---

## Quick Commands

```bash
# Start backend
cd backend && npm start

# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Check dependencies
npm list

# View database (if sqlite3 CLI installed)
sqlite3 kans.db

# Kill process on port 3000 (if needed)
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

---

## Version Info

- Node.js: 14+ recommended
- NPM: 6+
- Browser: Chrome, Firefox, Safari, Edge (recent versions)
- SQLite: Built-in via better-sqlite3
- Express: 4.18.2+
- Nodemailer: 6.9.7+

---

**Keep this handy for quick reference while developing!**
