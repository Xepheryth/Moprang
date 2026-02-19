# System Architecture & Data Flow

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Front.html)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐│
│  │ Login Modal  │  │Register Modal│  │ Forgot Password Modal   ││
│  │             │  │              │  │                         ││
│  │• Username   │  │• Username    │  │• Email input            ││
│  │• Password   │  │• Email       │  │• Submit button          ││
│  │• Login btn  │  │• Password    │  │• Status feedback        ││
│  │• "Lupa PW?" │  │• Confirm PW  │  │                         ││
│  │• Register   │  │• Register btn│  │  Lupa password? → YES   ││
│  │  link       │  │              │  │                         ││
│  └──────────────┘  └──────────────┘  └─────────────────────────┘│
│         ↓                  ↓                      ↓               │
│   POST /api/login    POST /api/register    POST /api/forgot-pw   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Reset Password Modal (opens after email sent)               ││
│  │                                                             ││
│  │• Token input (from email)                                   ││
│  │• New password input                                         ││
│  │• Confirm password input                                     ││
│  │• Reset button                                               ││
│  │• Status feedback                                            ││
│  │                                                             ││
│  │           ↓                                                 ││
│  │   POST /api/reset-password                                  ││
│  │           ↓                                                 ││
│  │   [Success] → Auto-login modal                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Client Storage (localStorage)                               ││
│  │ • kans_current: username                                    ││
│  │ • kans_token: JWT token                                     ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (fetch API)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (backend/server.js)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ POST /api/register   │  │ POST /api/login                  ││
│  │                      │  │                                  ││
│  │ 1. Validate email    │  │ 1. Find user by username         ││
│  │ 2. Validate password │  │ 2. Compare password hashes       ││
│  │ 3. Hash password     │  │ 3. Generate JWT token            ││
│  │ 4. Store in SQLite   │  │ 4. Return token + username       ││
│  │ 5. Return success    │  │                                  ││
│  └──────────────────────┘  └──────────────────────────────────┘│
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ POST /api/forgot-password                                 ││
│  │                                                            ││
│  │ 1. Find user by email                                     ││
│  │ 2. Generate reset token                                   ││
│  │    └─ crypto.randomBytes(32).toString('hex')             ││
│  │    └─ 64-character hexadecimal                           ││
│  │ 3. Set expiration (1 hour)                               ││
│  │ 4. Store token + expiration in SQLite                    ││
│  │ 5. Create HTML email with:                               ││
│  │    └─ Reset token (to copy-paste)                        ││
│  │    └─ Reset link with embedded token                     ││
│  │    └─ Expiration warning                                 ││
│  │ 6. Send email via nodemailer SMTP                        ││
│  │ 7. Return success message                                ││
│  │ 8. [On error] Log error but return success               ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ POST /api/reset-password                                  ││
│  │                                                            ││
│  │ 1. Receive token + new_password                           ││
│  │ 2. Query SQLite for matching token                        ││
│  │ 3. Verify token not expired (Date.now() < expiration)    ││
│  │ 4. Validate new password strength                         ││
│  │ 5. Hash new password with bcrypt                          ││
│  │ 6. Update password_hash in SQLite                         ││
│  │ 7. Clear reset_token and expiration                       ││
│  │ 8. Return success message                                 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ GET /api/me (Protected)                                   ││
│  │                                                            ││
│  │ 1. Check Authorization header for Bearer token            ││
│  │ 2. Verify JWT signature                                   ││
│  │ 3. Return user info from token payload                    ││
│  │ 4. If invalid: Return 401 Unauthorized                    ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Environment Variables (.env file):                             │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ SMTP_SERVICE=gmail                                        ││
│  │ SMTP_USER=your-email@gmail.com                            ││
│  │ SMTP_PASS=xxxx-xxxx-xxxx-xxxx                             ││
│  │                                                            ││
│  │ (Or custom SMTP):                                          ││
│  │ SMTP_HOST=smtp.company.com                                ││
│  │ SMTP_PORT=587                                             ││
│  │ SMTP_USER=noreply@company.com                             ││
│  │ SMTP_PASS=company-password                                ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (Email)
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL EMAIL SERVICE (SMTP)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Gmail / Outlook / Custom SMTP Server                            │
│                                                                   │
│  [Receives email from backend]                                   │
│         ↓                                                         │
│  [User receives email with:]                                     │
│  • Reset token (64 characters)                                   │
│  • Reset link with embedded token                                │
│  • HTML formatted with KANS branding                             │
│  • Expiration warning (1 hour)                                   │
│         ↓                                                         │
│  [User copies token]                                             │
│         ↓                                                         │
│  [Returns to browser and pastes token]                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (Manual)
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite - kans.db)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  users table:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id (INTEGER PRIMARY KEY)                                 │   │
│  │ username (TEXT, UNIQUE)                                  │   │
│  │ email (TEXT, UNIQUE)                                     │   │
│  │ password_hash (TEXT) - bcryptjs hashed password          │   │
│  │ reset_token (TEXT NULL) - 64-char hex during reset       │   │
│  │ reset_token_expires (INTEGER NULL) - millisecond epoch  │   │
│  │ created_at (TEXT) - ISO timestamp                        │   │
│  │                                                          │   │
│  │ Example row:                                             │   │
│  │ id=1                                                     │   │
│  │ username=johndoe                                         │   │
│  │ email=john@example.com                                   │   │
│  │ password_hash=$2b$10$N9qo8uLO... (bcryptjs)             │   │
│  │ reset_token=a3f2b1c8d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1│   │
│  │ reset_token_expires=1699564200000 (1 hour from now)     │   │
│  │ created_at=2024-01-15T10:30:00Z                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Password Reset Flow Sequence

```
TIME: 00:00 - User clicks "Lupa password?"
   Frontend                          Backend                 Database           Email Service
      │                                 │                         │                    │
      ├─ User enters email ────────────→│                         │                    │
      │                                 │                         │                    │
      │                     ┌─────────────────────────────────┐   │                    │
      │                     │ 1. Find user by email           │   │                    │
      │                     │ 2. Generate token              │   │                    │
      │                     │ 3. Set expiration (now + 1h)   │   │                    │
      │                     └─────────────────────────────────┘   │                    │
      │                                 │                         │                    │
      │                                 ├─────────────────────────→│ Store token       │
      │                                 │ (INSERT reset_token)     │ + expiration      │
      │                                 │                         │                    │
      │                                 ├─ Create email HTML ─────────────────────────→│
      │                                 │ (token + link + branding) │               Send │
      │                                 │                         │                 │
      │                                 │←─────────────────────────────── Success ────│
      │                                 │                         │                    │
      │←──── success + message ─────────│                         │                    │
      │                                 │                         │                    │
    Show: "✓ Link reset telah dikirim"

TIME: 00:15 - User receives email

   Frontend                          Backend                 Database           Email Service
      │                                 │                         │                    │
      │ User checks email               │                         │              [Email received]
      │ Copies token from email         │                         │                    │
      │ Pastes into Reset form          │                         │                    │

TIME: 00:30 - User submits reset form

      │                                 │                         │                    │
      ├─ token + new_password ────────→│                         │                    │
      │                                 │                         │                    │
      │                     ┌────────────────────────────────────┐ │                    │
      │                     │ 1. Find token in database          │ │                    │
      │                     │ 2. Verify not expired             │ │                    │
      │                     │ 3. Validate password strength    │ │                    │
      │                     │ 4. Hash new password              │ │                    │
      │                     └────────────────────────────────────┘ │                    │
      │                                 │                         │                    │
      │                                 ├──────────────────────────→│ Update password  │
      │                                 │ UPDATE password_hash     │ Clear token       │
      │                                 │ SET reset_token = NULL   │                    │
      │                                 │                         │                    │
      │←──── success message ──────────│                         │                    │
      │                                 │                         │                    │
    Show: "✓ Password berhasil direset"
    Auto-redirect to Login modal
    User logs in with new password → Success! ✓
```

## Token Expiration Timeline

```
T=0:00   → POST /api/forgot-password
         → Generate token
         → Set expiration = now + 3600000ms (1 hour)
         → Store in database
         → Send email

T=0:15   → User receives email
         → Copies token

T=0:30   → User submits reset form
         → POST /api/reset-password
         → Backend checks: Date.now() < reset_token_expires?
         → 30 min < 60 min? YES → Proceed
         → Update password
         → Clear token from database

T=0:45   → Another user tries with same token
         → Backend checks: 45 min < 60 min? YES → Still valid

T=1:05   → Token has expired (65 minutes passed)
         → Backend checks: 65 min < 60 min? NO
         → Return error: "Token tidak valid atau kadaluarsa"
         → User must request new reset link
```

## Security Layers

```
┌──────────────────────────────────────────────────────────────────┐
│ Layer 1: Token Generation Security                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Math.random() ← INSECURE (predictable)                          │
│ ↓                                                               │
│ crypto.randomBytes(32).toString('hex') ← SECURE (unpredictable)│
│                                                                  │
│ Result: 64-character hexadecimal token                          │
│ Odds of collision: 2^256 (effectively impossible)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ Layer 2: Token Storage Security                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Not sent via URL (avoid browser history)                        │
│ Sent via email (user must access email account)                │
│ Stored in database (not in HTML/URL)                            │
│ One-time use (cleared immediately after reset)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ Layer 3: Password Security                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ New password validated:                                          │
│ • 8+ characters (prevents weak passwords)                       │
│ • Uppercase + lowercase (increases complexity)                 │
│ • Numbers required (meets complexity standards)                │
│                                                                  │
│ New password hashed:                                             │
│ • Bcryptjs algorithm (cryptographically secure)                │
│ • Salt generated per password (prevents rainbow tables)         │
│ • Hash stored in database (original never stored)              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ Layer 4: Email Verification                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Proves account ownership (user must control email)              │
│ Prevents account takeover (attacker needs email access)         │
│ Token only sent to verified email (not in URL)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ Layer 5: Time-Based Expiration                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Tokens expire after 1 hour                                       │
│ Prevents unlimited reset attempts                               │
│ Prevents old tokens from being exploited                        │
│ Forces users to act quickly                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Through System

```
User Input (Frontend)
        ↓
JavaScript Validation
        ↓
Fetch API to Backend
        ↓
Express Middleware (CORS, JSON parser)
        ↓
Business Logic (validation, token generation)
        ↓
SQLite Database Operations
        ↓
Nodemailer SMTP Connection
        ↓
Email Service Delivery
        ↓
User Inbox
        ↓
User copies token
        ↓
Pastes into reset form
        ↓
Fetch API to Backend (/api/reset-password)
        ↓
Backend validates token
        ↓
Backend updates database
        ↓
Response sent to frontend
        ↓
Redirect to login modal
        ↓
User logs in with new password → Success!
```

---

This architecture provides:
- ✅ Secure token generation and storage
- ✅ Email-based verification (proves account ownership)
- ✅ Time-limited recovery (1 hour window)
- ✅ Password strength enforcement
- ✅ One-time token use (prevents replay attacks)
- ✅ Secure password hashing (bcryptjs)
- ✅ Environment-based configuration (no hardcoded secrets)
