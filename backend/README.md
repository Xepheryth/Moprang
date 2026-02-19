KANS Auth Backend (example)

This is a minimal Express backend providing example `/api/register` and `/api/login` endpoints using bcrypt (password hashing) and JWT.

Prerequisites
- Node.js 16+ and npm

Install

```powershell
cd backend
npm install
```

### Setup HTTPS (Development)

For secure authentication, generate SSL certificates:

**Windows:**
```powershell
.\generate-ssl.bat
```

**Mac/Linux:**
```bash
bash generate-ssl.sh
```

This creates `server.key` and `server.crt` for HTTPS.

### Run

**With HTTPS (default):**
```powershell
npm start
```
Server runs on `https://localhost:3000`

**Force HTTP:**
```powershell
$env:USE_HTTPS='false'; npm start
```

**Previous run command:**

```powershell
# dev (requires nodemon)
npm run dev

# or production
npm start
```

### Environment Variables
 - `SESSION_SECRET` - Session secret for OAuth (change in production)
 - `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
 - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
 - `GOOGLE_CALLBACK_URL` - OAuth callback URL (optional, default https://localhost:3000/auth/google/callback)
 - `APP_BASE_URL` - Base URL of your frontend (used in email links and OAuth redirect)
- `PORT` (default 3000)
- `JWT_SECRET` default provided (change in production!)

Endpoints
- POST `/api/register` -> { username, password }
  - 200: { success:true, message }
  - 400: { success:false, message }

- POST `/api/login` -> { username, password }
  - 200: { success:true, message, token, username }
  - 401: { success:false }

- GET `/api/me` (protected) -> requires header `Authorization: Bearer <token>`
### HTTPS Endpoints (Secure)

All auth endpoints are available over HTTPS:

```powershell
# register (HTTPS)
curl -Method POST -Uri https://localhost:3000/api/register -SkipCertificateCheck `
  -Body (ConvertTo-Json @{ username='alice'; password='Test123' }) `
  -ContentType 'application/json'

# login (HTTPS)
curl -Method POST -Uri https://localhost:3000/api/login -SkipCertificateCheck `
  -Body (ConvertTo-Json @{ username='alice'; password='Test123' }) `
  -ContentType 'application/json'
```

**Note:** `-SkipCertificateCheck` is needed because the certificate is self-signed (development only)

Testing with curl (PowerShell)

```powershell
# register
curl -Method POST -Uri http://localhost:3000/api/register -Body (ConvertTo-Json @{ username='alice'; password='pass123' }) -ContentType 'application/json'

# login
curl -Method POST -Uri http://localhost:3000/api/login -Body (ConvertTo-Json @{ username='alice'; password='pass123' }) -ContentType 'application/json'
```

Notes
- This is example code for local development and learning. Do NOT use in production without proper hardening (secure JWT secret, HTTPS, rate limiting, input validation, etc.).
