# Quick Email Password Reset Test

## 30-Second Setup

### Step 1: Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select: Mail → Windows Computer
3. Copy the 16-character password (remove spaces)

### Step 2: Create backend/.env
```
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxxxxxxxxxxxxxx
```

### Step 3: Start Backend
```bash
cd backend
npm install
npm start
```

### Step 4: Test Reset Flow

**In Browser:**
1. Open `Front.html`
2. Click "Daftar" → Register with:
   - Username: `testuser`
   - Email: `your-email@gmail.com`
   - Password: `Test@1234`
3. Click "Lupa password?" → Enter email → Send
4. Wait 15 seconds for email
5. Copy token from email
6. Paste token → New password: `NewPass@5678` → Reset
7. Login with new password

**Expected Results:**
- ✓ Email arrives in inbox within 30 seconds
- ✓ Email contains 64-char token
- ✓ Password reset succeeds
- ✓ Login works with new password

## If Email Doesn't Arrive

**Check 1:** Is backend running?
- See "Server running on port 3000" in console

**Check 2:** Is .env file correct?
- Verify `SMTP_USER` and `SMTP_PASS` are correct
- Verify `SMTP_SERVICE=gmail`

**Check 3:** Gmail Setup
- Turn OFF "Less secure apps" (incompatible with app passwords)
- Verify app password is 16 characters (copy from Gmail)
- Check spam folder

**Check 4:** Backend Console
- Any error messages printed?
- Check server console for email sending errors

## Common Errors

| Error | Solution |
|-------|----------|
| Button disabled after clicking send | Backend not running |
| "Token tidak valid" on reset | Used wrong token or token expired (>1 hour old) |
| Password reset fails | Password too weak (min 8 chars, uppercase, lowercase, number) |
| Email in spam folder | Mark as "Not Spam" and add sender to contacts |

## Files to Check

- `backend/.env` - Contains email credentials
- `backend/server.js` - Email sending logic (lines 165-195)
- `script.js` - Frontend handlers (lines ~440-475, ~480-520)
- `Front.html` - Modal HTML for forms

## Support Files

- **Full Setup Guide:** `backend/EMAIL_SETUP_GUIDE.md`
- **Server Code:** `backend/server.js`
- **Frontend Code:** `script.js` (search for "forgot" or "reset")
