# Deployment & Testing Checklist

## Pre-Deployment Setup

### Step 1: Prepare SMTP Credentials
- [ ] Choose email provider (Gmail recommended for testing)
- [ ] For Gmail:
  - [ ] Enable 2-Factor Authentication on Google account
  - [ ] Visit https://myaccount.google.com/apppasswords
  - [ ] Select "Mail" and "Windows Computer"
  - [ ] Copy the 16-character app password
  - [ ] Remove spaces: `xxxxxxxxxxxxxxxx`
- [ ] For other providers:
  - [ ] Get SMTP hostname
  - [ ] Get SMTP port (usually 587 or 465)
  - [ ] Get username/email
  - [ ] Get password or app password

### Step 2: Create Backend Configuration
- [ ] Navigate to `backend/` folder
- [ ] Create new file: `.env`
- [ ] Add configuration:
  ```
  SMTP_SERVICE=gmail
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=xxxx-xxxx-xxxx-xxxx
  ```
- [ ] Save file (no quotes needed)
- [ ] Verify file is NOT in git (add to .gitignore if needed)

### Step 3: Install Dependencies
- [ ] Open terminal in `backend/` folder
- [ ] Run: `npm install`
- [ ] Wait for completion
- [ ] Verify: `npm list` shows all dependencies installed

### Step 4: Start Backend Server
- [ ] In terminal, run: `npm start`
- [ ] Look for message: "Server running on port 3000"
- [ ] If error appears:
  - [ ] Check `.env` file exists in backend folder
  - [ ] Check SMTP credentials are correct
  - [ ] Check port 3000 is not in use
  - [ ] Run `npm install` again if needed

---

## Test Scenario 1: Basic Registration & Login

### Steps:
1. [ ] Open `Front.html` in web browser (Chrome/Firefox/Edge)
2. [ ] See KANS home page
3. [ ] Click "Daftar" (Register) button in header
4. [ ] Fill registration form:
   - [ ] Username: `testuser1`
   - [ ] Email: `your-personal-email@gmail.com`
   - [ ] Password: `TestPass123` (must have uppercase, lowercase, number)
   - [ ] Confirm: `TestPass123`
5. [ ] Click "Daftar" button
6. [ ] Expected: Success message or auto-login
7. [ ] Close modal (click Batal or X)
8. [ ] Verify logged in (see username in top right)
9. [ ] Click "Profil" to view profile page
10. [ ] Expected: See username and "Logged in" timestamp

### Verification:
- [ ] Username appears in top-right corner
- [ ] User badge shows with logout button
- [ ] Profile page loads with correct data
- [ ] Navigation shows profile link active

---

## Test Scenario 2: Password Reset Flow (CRITICAL)

### Part A: Trigger Reset Email

1. [ ] Click "Logout" button (top right)
2. [ ] Expected: Logged out, see "Daftar" and "Login" buttons again
3. [ ] Click "Login" button
4. [ ] In login modal, click "Lupa password?" link
5. [ ] Fill forgot password form:
   - [ ] Email: `your-personal-email@gmail.com` (same as registration)
6. [ ] Click "Kirim Link Reset" button
7. [ ] Expected: Status changes to blue "Mengirim..."
8. [ ] Expected: After 2 seconds, turns green "✓ Link reset telah dikirim"
9. [ ] Expected: Modal auto-closes and Reset Password modal opens

### Verification - Email Delivery:
- [ ] Check email inbox (wait 15-30 seconds)
- [ ] If not in inbox:
  - [ ] Check spam/junk folder
  - [ ] Look for sender: `your-email@gmail.com` (from .env)
  - [ ] Subject: "KANS - Password Reset Request"
- [ ] Email should contain:
  - [ ] Reset code (64-character hex string)
  - [ ] Reset link with embedded token
  - [ ] Expiration warning ("valid for 1 hour")
  - [ ] Professional HTML formatting
- [ ] Copy the reset code from email

### Part B: Complete Password Reset

10. [ ] Return to browser with Reset Password modal open
11. [ ] Fill reset password form:
    - [ ] Kode Reset: `paste-the-64-char-code-from-email`
    - [ ] Password Baru: `NewPass456` (must have uppercase, lowercase, number)
    - [ ] Konfirmasi Password: `NewPass456`
12. [ ] Click "Reset Password" button
13. [ ] Expected: Status shows blue "Memproses..."
14. [ ] Expected: After 2 seconds, turns green "✓ Password berhasil direset"
15. [ ] Expected: Modal closes and Login modal opens

### Verification - New Password Works:
16. [ ] In login modal, enter:
    - [ ] Username: `testuser1`
    - [ ] Password: `NewPass456` (NEW password)
17. [ ] Click "Login" button
18. [ ] Expected: Login succeeds, modal closes
19. [ ] Expected: See username in top-right corner
20. [ ] Verify old password NO LONGER works:
    - [ ] Logout
    - [ ] Try login with `TestPass123` (old password)
    - [ ] Expected: Login fails with error message

### Verification - Token Security:
21. [ ] Go back to email and copy the reset code again
22. [ ] Try to use the SAME code in reset form:
    - [ ] Logout again
    - [ ] Try to reset with old code
    - [ ] Expected: Error message "Token tidak valid atau kadaluarsa"
    - [ ] Reason: Token cleared after first use (security feature)

---

## Test Scenario 3: Error Cases

### Test 3A: Invalid Email
1. [ ] Click "Login" → "Lupa password?"
2. [ ] Enter email: `nonexistent@example.com`
3. [ ] Click "Kirim Link Reset"
4. [ ] Expected: Error message (email not registered)

### Test 3B: Weak Password
1. [ ] Trigger password reset with valid email
2. [ ] In reset form, enter:
   - [ ] Token: `valid-token-from-email`
   - [ ] Password: `weak` (too short, no uppercase/number)
3. [ ] Click "Reset Password"
4. [ ] Expected: Error "Password minimal 8 karakter" (client-side validation)
5. [ ] Try: `Weak1234` but no uppercase in new part
6. [ ] Expected: Similar validation error

### Test 3C: Mismatched Passwords
1. [ ] In reset form, enter:
   - [ ] Token: `valid-token`
   - [ ] Password: `NewPass123`
   - [ ] Confirm: `NewPass456` (different!)
2. [ ] Click "Reset Password"
3. [ ] Expected: Error "Password tidak cocok"

### Test 3D: Missing Token
1. [ ] In reset form, leave token empty
2. [ ] Enter passwords: `NewPass123` and `NewPass123`
3. [ ] Click "Reset Password"
4. [ ] Expected: Alert "Kode reset diperlukan"

### Test 3E: Backend Connection Failure
1. [ ] Stop backend server (Ctrl+C in terminal)
2. [ ] Try to register or login
3. [ ] Expected: Error message or timeout
4. [ ] Restart backend server
5. [ ] Operations should work again

---

## Test Scenario 4: Backend Verification

### Check 4A: Database Contents
1. [ ] In backend terminal/console
2. [ ] Stop server (Ctrl+C)
3. [ ] Check for `kans.db` file in backend folder
4. [ ] If you have SQLite client:
   - [ ] `sqlite3 kans.db`
   - [ ] `.tables` → should see `users`
   - [ ] `SELECT username, email FROM users;` → should see `testuser1`

### Check 4B: Email Service Logs
1. [ ] Look at backend console output
2. [ ] For each reset attempt, should see:
   - [ ] "Sending reset email to: user@example.com"
   - [ ] "Email sent successfully" or similar
3. [ ] If errors appear:
   - [ ] "Error sending email: ..." → SMTP problem
   - [ ] Check `.env` file SMTP_USER and SMTP_PASS
   - [ ] For Gmail: Verify app password is correct
   - [ ] Restart backend after fixing `.env`

### Check 4C: Token Generation
1. [ ] Backend console should not show token values
2. [ ] If you see 64-char hex in logs:
   - [ ] Verify it's generated each time (different value)
   - [ ] Example: `a3f2b1c8d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`

### Check 4D: Password Hashing
1. [ ] Hashed passwords should start with `$2b$10$`
2. [ ] Never see plain-text password in database
3. [ ] Example hash: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b/76jdgufsqFxiBC1Ty1394`

---

## Test Scenario 5: Multiple Users

1. [ ] Register second user:
   - [ ] Username: `testuser2`
   - [ ] Email: `another-email@gmail.com`
   - [ ] Password: `Test2Pass123`

2. [ ] Test password reset for second user:
   - [ ] Logout testuser1
   - [ ] Login as testuser2
   - [ ] Logout
   - [ ] Click "Lupa password?"
   - [ ] Enter `another-email@gmail.com`
   - [ ] Verify email sent
   - [ ] Check email received
   - [ ] Reset password to `New2Pass456`
   - [ ] Login with new password

3. [ ] Verify isolation:
   - [ ] testuser1 can still login with `NewPass456`
   - [ ] testuser2 cannot login with old password
   - [ ] Each user's profile shows correct username

---

## Test Scenario 6: Performance & Edge Cases

1. [ ] Rapid Resets:
   - [ ] Request reset multiple times quickly
   - [ ] Each should generate new token
   - [ ] Only latest token should work
   - [ ] Previous tokens should fail

2. [ ] Long Token:
   - [ ] Copy full 64-char token (no truncation)
   - [ ] Paste carefully into form
   - [ ] Should work if complete and valid

3. [ ] Token Expiration:
   - [ ] Request reset
   - [ ] Wait 1 hour (or modify backend for testing)
   - [ ] Try to use token
   - [ ] Should fail with expiration message

4. [ ] Concurrent Resets:
   - [ ] Two browser windows open
   - [ ] Both request resets simultaneously
   - [ ] Each should work independently

---

## Post-Test Cleanup

1. [ ] [ ] Delete test emails from email account
2. [ ] [ ] Delete test users from database (optional)
3. [ ] [ ] Backup `.env` file (important!)
4. [ ] [ ] Document any issues found
5. [ ] [ ] If production: Move `.env` to secure location

---

## Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not arriving | SMTP credentials wrong | Check `.env`, verify app password |
| Email in spam | Gmail filtering | Mark as "Not Spam", add to contacts |
| Backend won't start | Port 3000 in use | Kill process or use different port |
| "Backend not responding" | Server stopped | Run `npm start` in backend folder |
| Token invalid immediately | Token not copied correctly | Re-copy from email, paste carefully |
| Password too weak error | Doesn't meet requirements | Min 8 chars, uppercase, lowercase, number |
| Database errors | Wrong permissions | Check file ownership in backend folder |
| CORS errors | Backend CORS disabled | Check server.js has `app.use(cors())` |

---

## Success Criteria

✅ **Tests PASS when:**

- [ ] Registration creates user account
- [ ] Login works with correct credentials
- [ ] Profile page shows logged-in user
- [ ] "Lupa password?" opens forgot modal
- [ ] Forgot password sends email
- [ ] Email arrives within 30 seconds
- [ ] Email contains 64-char reset token
- [ ] Reset token works to update password
- [ ] New password allows login
- [ ] Old password no longer works
- [ ] Token can only be used once
- [ ] Error messages appear for invalid inputs
- [ ] Backend logs show email sent successfully
- [ ] Database stores hashed passwords
- [ ] Multiple users can reset independently

---

## Final Sign-Off

| Check | Status |
|-------|--------|
| Backend running | ☐ Yes |
| Email configured | ☐ Yes |
| Email sending | ☐ Yes |
| Registration works | ☐ Yes |
| Login works | ☐ Yes |
| Password reset works | ☐ Yes |
| Error handling works | ☐ Yes |
| Database persists data | ☐ Yes |
| Multiple users tested | ☐ Yes |
| Ready for production | ☐ Yes |

---

## Next Steps After Passing Tests

1. **If All Tests Pass:**
   - [ ] Document any customizations made
   - [ ] Set up monitoring for email failures
   - [ ] Configure rate limiting (optional)
   - [ ] Plan for email verification (future)
   - [ ] Deploy to production

2. **If Issues Found:**
   - [ ] See "Issues & Troubleshooting" table above
   - [ ] Fix issue
   - [ ] Re-run failing test
   - [ ] Repeat until all tests pass

3. **Production Deployment:**
   - [ ] Use environment variables for all secrets
   - [ ] Enable HTTPS/SSL
   - [ ] Set up automated backups
   - [ ] Configure email service redundancy
   - [ ] Monitor system logs
   - [ ] Set up alerts for errors
   - [ ] Document deployment procedure

---

## Support Resources

- **Setup Guide:** `backend/EMAIL_SETUP_GUIDE.md`
- **Quick Start:** `QUICK_TEST_EMAIL.md`
- **Architecture:** `SYSTEM_ARCHITECTURE.md`
- **Implementation:** `IMPLEMENTATION_COMPLETE.md`
- **Tech Docs:** This file

**For help:** Check backend console for errors, browser console (F12) for frontend errors
