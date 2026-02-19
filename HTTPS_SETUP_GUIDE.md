# HTTPS Setup Guide - KANS Authentication

## Overview

KANS authentication now supports HTTPS for secure communication. This is essential for protecting sensitive data like passwords and authentication tokens.

---

## Why HTTPS?

✅ **Secure** - Encrypted communication (prevent man-in-the-middle attacks)
✅ **Protected** - Passwords and tokens encrypted in transit
✅ **Standard** - Industry requirement for production systems
✅ **Trust** - Users see secure connection indicator

---

## Setup Instructions

### Step 1: Generate SSL Certificates

HTTPS requires SSL certificates. For local development, we'll create self-signed certificates.

**Windows (PowerShell):**
```powershell
cd backend
.\generate-ssl.bat
```

**Mac/Linux (Bash):**
```bash
cd backend
bash generate-ssl.sh
```

**Output:**
```
✅ SSL certificates generated:
   - server.key
   - server.crt
```

### Step 2: Start Backend with HTTPS

```bash
npm start
```

You should see:
```
✅ KANS auth backend listening on https://localhost:3000
```

### Step 3: Update Frontend (if needed)

The frontend is already configured to use HTTPS:
```javascript
const API_BASE = 'https://localhost:3000/api';
```

---

## SSL Certificate Details

### What's Generated

| File | Purpose | Notes |
|------|---------|-------|
| `server.key` | Private key | Keep secure, don't share |
| `server.crt` | Certificate | Self-signed, valid for 365 days |

### Certificate Properties

- **Type:** Self-signed X.509 certificate
- **Algorithm:** RSA 2048-bit
- **Valid for:** 365 days
- **CN (Common Name):** localhost
- **Organization:** KANS
- **Country:** ID (Indonesia)

### Browser Warning

When accessing `https://localhost:3000`, your browser will show:
```
⚠️  Your connection is not private
    Attackers might be trying to steal your information
```

This is **normal and expected** for self-signed certificates in development. Click:
- **Chrome/Edge:** "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox:** "Advanced" → "Accept Risk and Continue"
- **Safari:** "Show Details" → "Visit this website"

---

## Configuration

### Enable/Disable HTTPS

**Enable HTTPS (default):**
```bash
npm start
# or
USE_HTTPS=true npm start
```

**Disable HTTPS (HTTP only):**
```bash
USE_HTTPS=false npm start
```

### Environment Variables

Add to `backend/.env`:
```env
# HTTPS configuration
USE_HTTPS=true

# SSL certificate paths (optional)
# SSL_KEY=./server.key
# SSL_CERT=./server.crt
```

---

## Testing HTTPS

### Using Browser

1. Open `Front.html` in browser
2. Click "Login" or "Daftar"
3. Check browser console (F12 → Console)
4. Should see no CORS or HTTPS errors
5. Network requests should show `https://`

### Using curl (PowerShell)

```powershell
# Skip certificate check (for self-signed cert)
curl -Method POST -Uri https://localhost:3000/api/login -SkipCertificateCheck `
  -Body (ConvertTo-Json @{ username='test'; password='Pass123' }) `
  -ContentType 'application/json'
```

### Using curl (Bash)

```bash
# Skip certificate check (for self-signed cert)
curl -k -X POST https://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Pass123"}'
```

---

## Production Deployment

For production, you need a **valid SSL certificate** from a trusted Certificate Authority (CA):

### Options

1. **Let's Encrypt (Free)**
   - https://letsencrypt.org/
   - Automated certificate generation
   - Recommended for production

2. **Commercial CA**
   - Symantec, Verisign, DigiCert, etc.
   - More expensive but longer support

3. **Cloud Provider**
   - AWS Certificate Manager (ACM)
   - Google Cloud Certificate Manager
   - Azure Key Vault
   - Usually included with cloud hosting

### Production Setup

```javascript
// In production, use real certificates
const https = require('https');
const fs = require('fs');

const key = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem');
const cert = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem');

const options = { key, cert };
https.createServer(options, app).listen(443);
```

### Environment Variables (Production)

```bash
# Production HTTPS
USE_HTTPS=true
SSL_KEY=/etc/ssl/private/yourdomain.key
SSL_CERT=/etc/ssl/certs/yourdomain.crt

# JWT secret (change from default!)
JWT_SECRET=your-very-secure-random-secret-here

# Email configuration
SMTP_SERVICE=gmail
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=app-specific-password
```

---

## Certificate Renewal

### Self-Signed (Development)

Every 365 days, regenerate:
```bash
cd backend
bash generate-ssl.sh  # or generate-ssl.bat on Windows
```

### Let's Encrypt (Production)

Automatically renewed (certbot handles this):
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
```

---

## Troubleshooting

### Certificate Not Found

**Error:**
```
⚠️  HTTPS enabled but SSL certificates not found
```

**Solution:**
```bash
# Generate certificates
cd backend
bash generate-ssl.sh  # Mac/Linux
# or
generate-ssl.bat      # Windows
```

### OpenSSL Not Found

**Error:**
```
openssl: command not found
```

**Solution:**

Windows:
- Install Git for Windows (includes OpenSSL)
- Or install standalone OpenSSL: https://slproweb.com/products/Win32OpenSSL.html

Mac:
```bash
brew install openssl
```

Linux:
```bash
sudo apt install openssl
```

### HTTPS Connection Refused

**Error:**
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Solution:**
1. Verify backend is running: `npm start`
2. Check certificates exist: `ls -la backend/server.key server.crt`
3. Check port 3000 is free: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)

### Browser Certificate Warning Won't Go Away

**For Development Only:**

Chrome:
- Click "Advanced"
- Click "Proceed to localhost (unsafe)"
- Or type `thisisunsafe` on the warning page

Firefox:
- Click "Advanced"
- Click "Accept Risk and Continue"

This is expected for self-signed certificates. In production with a valid certificate, the warning will not appear.

### Mixed Content Error

**Error:**
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure resource 'http://...'
```

**Solution:**
Ensure ALL requests use HTTPS:
```javascript
// ✅ Correct
const API_BASE = 'https://localhost:3000/api';

// ❌ Wrong
const API_BASE = 'http://localhost:3000/api';
```

---

## Security Checklist

Development:
- [x] HTTPS enabled
- [x] Self-signed certificates generated
- [x] JWT secret in use
- [x] Password hashing (bcryptjs)
- [x] CORS configured

Production:
- [ ] Valid SSL certificate from CA
- [ ] JWT_SECRET changed from default
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HSTS headers set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Password reset tokens hashed
- [ ] Database backups configured
- [ ] Monitoring/logging enabled
- [ ] Access logs maintained

---

## HTTPS Checklist for Frontend

Update `Front.html` or `script.js` to use HTTPS URLs:

```javascript
// ✅ Development (self-signed cert is OK)
const API_BASE = 'https://localhost:3000/api';

// ✅ Production (valid certificate required)
const API_BASE = 'https://api.yourdomain.com/api';
```

---

## Reference

### OpenSSL Certificate Generation

Full command:
```bash
openssl req -x509 -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -days 365 \
  -nodes \
  -subj "/CN=localhost/O=KANS/C=ID"
```

Parameters:
- `-x509` - Self-signed certificate format
- `-newkey rsa:2048` - RSA key, 2048-bit encryption
- `-keyout server.key` - Output private key file
- `-out server.crt` - Output certificate file
- `-days 365` - Valid for 365 days
- `-nodes` - No encryption on private key (development only)
- `-subj` - Certificate subject (automatic, no prompt)

### HTTPS Configuration in Express

```javascript
const https = require('https');
const fs = require('fs');
const app = express();

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});
```

### Force HTTPS Redirect

In production, redirect HTTP → HTTPS:

```javascript
app.use((req, res, next) => {
  if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

---

## Support

**Issues with HTTPS setup?**

1. Check certificate files exist:
   ```bash
   ls -la backend/server.key backend/server.crt
   ```

2. Check port is free:
   ```bash
   lsof -i :3000  # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   ```

3. Check backend output for errors:
   ```
   npm start
   ```

4. Browser console (F12 → Console) for errors

**For Production:**
- Contact your hosting provider for SSL certificate setup
- Follow their documentation for Let's Encrypt or commercial certificates

---

## Quick Reference

| Task | Command |
|------|---------|
| Generate certificates | `bash generate-ssl.sh` or `generate-ssl.bat` |
| Start with HTTPS | `npm start` |
| Start without HTTPS | `USE_HTTPS=false npm start` |
| Check certificates | `ls backend/server.{key,crt}` |
| Test HTTPS | `curl -k https://localhost:3000/api/login` |
| View certificate info | `openssl x509 -in server.crt -text -noout` |

---

**HTTPS is now enabled for all authentication endpoints!** 🔒

Next: Open `Front.html` and test the secure authentication flow.
