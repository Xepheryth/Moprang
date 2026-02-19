const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const DB_FILE = path.join(__dirname, 'kans.db');
const USE_HTTPS = process.env.USE_HTTPS !== 'false'; // Default true
const SSL_KEY_FILE = path.join(__dirname, 'server.key');
const SSL_CERT_FILE = path.join(__dirname, 'server.crt');

// Configure nodemailer (use Gmail or your email provider)
// For Gmail: enable "App Password" in security settings (not regular password)
// Environment variables: SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Verify transporter connection (optional, for debugging)
transporter.verify((err, success) => {
  if(err){
    console.warn('⚠️  Nodemailer not configured properly:', err.message);
    console.warn('Set SMTP_USER and SMTP_PASS environment variables to enable email sending');
  } else {
    console.log('✓ Email service ready');
  }
});

// Initialize SQLite database
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

// Create users table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires INTEGER,
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    email_verification_expires INTEGER,
    twofa_enabled INTEGER DEFAULT 0,
    twofa_secret TEXT,
    oauth_provider TEXT,
    oauth_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create tables for projects, areas, items
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    period TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    volume TEXT,
    unit TEXT,
    FOREIGN KEY(area_id) REFERENCES areas(id) ON DELETE CASCADE
  );
`);

const app = express();

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
if(!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const username = req.user?.username || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `${username}_${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if(allowedMimes.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan'));
    }
  }
});

app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));
// Session + passport for OAuth flows
app.use(session({ secret: process.env.SESSION_SECRET || 'kans_session_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Ensure new columns exist for older DBs (add if missing)
const cols = db.prepare("PRAGMA table_info(users)").all().map(c=>c.name);
function addColumnIfMissing(name, def){
  if(!cols.includes(name)){
    try{
      db.prepare(`ALTER TABLE users ADD COLUMN ${name} ${def}`).run();
      console.log(`Added column ${name} to users table`);
    }catch(e){ console.warn('Could not add column', name, e.message); }
  }
}

// OAuth routes (Google)
if(passport._strategy && process.env.GOOGLE_CLIENT_ID){
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));

  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/?oauth_error=1' }), (req,res)=>{
    // User is authenticated via passport; create JWT and redirect to frontend with token
    const user = req.user;
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    const redirectTo = (process.env.APP_BASE_URL || 'https://localhost:3000') + `/oauth?token=${token}`;
    res.redirect(redirectTo);
  });
}
addColumnIfMissing('email_verified','INTEGER DEFAULT 0');
addColumnIfMissing('email_verification_token','TEXT');
addColumnIfMissing('email_verification_expires','INTEGER');
addColumnIfMissing('twofa_enabled','INTEGER DEFAULT 0');
addColumnIfMissing('twofa_secret','TEXT');
addColumnIfMissing('oauth_provider','TEXT');
addColumnIfMissing('oauth_id','TEXT');
addColumnIfMissing('profile_photo','TEXT');

// Passport Google strategy
if(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET){
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://localhost:3000/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done)=>{
    try{
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if(!email) return done(new Error('No email in profile'));
      // Find or create user
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if(!user){
        const stmt = db.prepare('INSERT INTO users (username, email, password_hash, email_verified, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?, ?)');
        const dummyHash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
        const info = stmt.run(profile.displayName || email.split('@')[0], email, dummyHash, 1, 'google', profile.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      } else {
        // update oauth info if missing
        const update = db.prepare('UPDATE users SET oauth_provider = ?, oauth_id = ?, email_verified = 1 WHERE id = ?');
        update.run('google', profile.id, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
      return done(null, user);
    }catch(e){
      return done(e);
    }
  }));

  passport.serializeUser((user, done)=> done(null, user.id));
  passport.deserializeUser((id, done)=>{
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user || null);
  });
}

// Password strength validation (min 8 chars, must include uppercase, lowercase, number)
function validatePasswordStrength(password){
  if(password.length < 8) return { ok: false, msg: 'Password minimal 8 karakter' };
  if(!/[A-Z]/.test(password)) return { ok: false, msg: 'Password harus mengandung huruf besar' };
  if(!/[a-z]/.test(password)) return { ok: false, msg: 'Password harus mengandung huruf kecil' };
  if(!/[0-9]/.test(password)) return { ok: false, msg: 'Password harus mengandung angka' };
  return { ok: true };
}

// Simple email validation
function validateEmail(email){
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Generate secure reset token using crypto.randomBytes
function generateResetToken(){
  return crypto.randomBytes(32).toString('hex');
}

// Health
app.get('/api/ping', (req,res)=>{
  res.json({ ok:true, time: Date.now() });
});

// Register
app.post('/api/register', async (req,res)=>{
  const { username, email, password } = req.body || {};
  if(!username || !email || !password) return res.status(400).json({ success:false, message: 'Username, email, dan password diperlukan' });

  // Validate email format
  if(!validateEmail(email)) return res.status(400).json({ success:false, message: 'Format email tidak valid' });

  // Check password strength
  const pwCheck = validatePasswordStrength(password);
  if(!pwCheck.ok) return res.status(400).json({ success:false, message: pwCheck.msg });

  try{
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    // generate email verification token (valid 24 hours)
    const evToken = crypto.randomBytes(24).toString('hex');
    const evExpiry = Date.now() + (24*60*60*1000);

    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(username, email, hash, 0, evToken, evExpiry);

    // send verification email
    const verifyLink = `${process.env.APP_BASE_URL || 'https://localhost:3000'}/api/verify-email?token=${evToken}`;
    try{
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'KANS - Email Verification',
        html: `<p>Hi ${username},</p>
               <p>Thanks for registering. Please verify your email by clicking the link below:</p>
               <p><a href="${verifyLink}">Verify Email</a></p>
               <p>If you can't click the link, use this code:</p>
               <pre style="background:#f0f0f0;padding:8px;border-radius:4px;">${evToken}</pre>
               <p>This link expires in 24 hours.</p>`
      });
    }catch(err){
      console.warn('Error sending verification email', err.message);
    }

    res.json({ success:true, message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.' });
  }catch(e){
    if(e.message.includes('UNIQUE')){
      if(e.message.includes('username')) return res.status(400).json({ success:false, message: 'Username sudah terdaftar' });
      if(e.message.includes('email')) return res.status(400).json({ success:false, message: 'Email sudah terdaftar' });
    }
    return res.status(500).json({ success:false, message: 'Terjadi kesalahan' });
  }
});

// Login
app.post('/api/login', async (req,res)=>{
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({ success:false, message: 'Username dan password diperlukan' });

  try{
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username);
    if(!row) return res.status(401).json({ success:false, message: 'Username atau password salah' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if(!ok) return res.status(401).json({ success:false, message: 'Username atau password salah' });

    // Require email verification
    if(!row.email_verified){
      return res.status(403).json({ success:false, message: 'Email belum diverifikasi. Silakan cek inbox.' });
    }

    // If user has 2FA enabled, indicate that front-end should request TOTP code
    if(row.twofa_enabled){
      return res.json({ success:true, message: '2FA required', need2fa:true, username: row.username });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success:true, message: 'Login sukses', token, username: row.username });
  }catch(e){
    return res.status(500).json({ success:false, message: 'Terjadi kesalahan' });
  }
});

// Verify email endpoint
app.get('/api/verify-email', (req,res)=>{
  const token = req.query.token;
  if(!token) return res.status(400).send('Token verifikasi diperlukan');
  try{
    const stmt = db.prepare('SELECT id, email_verification_expires FROM users WHERE email_verification_token = ?');
    const user = stmt.get(token);
    if(!user) return res.status(400).send('Token verifikasi tidak valid');
    if(Date.now() > user.email_verification_expires) return res.status(400).send('Token verifikasi kadaluarsa');
    const update = db.prepare('UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?');
    update.run(user.id);
    return res.send('Email berhasil diverifikasi. Silakan kembali ke aplikasi dan login.');
  }catch(e){
    return res.status(500).send('Terjadi kesalahan');
  }
});

// Protected example route
app.get('/api/me', (req,res)=>{
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if(parts.length!==2 || parts[0] !== 'Bearer') return res.status(401).json({ success:false, message:'Missing token' });
  const token = parts[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    return res.json({ success:true, user: data });
  }catch(e){
    return res.status(401).json({ success:false, message: 'Invalid token' });
  }
});

// Get user profile (with photo)
app.get('/api/profile', authenticateJWT, (req,res)=>{
  try{
    const username = req.user.username;
    const user = db.prepare('SELECT id, username, email, profile_photo FROM users WHERE username = ?').get(username);
    if(!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, profile: user });
  }catch(e){
    res.status(500).json({ success:false, message:'Terjadi kesalahan' });
  }
});

// Upload profile photo
app.post('/api/profile/photo', authenticateJWT, upload.single('photo'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ success:false, message:'No file uploaded' });
    
    const username = req.user.username;
    const user = db.prepare('SELECT id, profile_photo FROM users WHERE username = ?').get(username);
    if(!user) return res.status(404).json({ success:false, message:'User not found' });
    
    // Delete old photo if exists
    if(user.profile_photo){
      try{
        const oldPhotoPath = path.join(uploadsDir, path.basename(user.profile_photo));
        if(fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }catch(e){ console.warn('Could not delete old photo:', e.message); }
    }
    
    // Save new photo path to DB
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    db.prepare('UPDATE users SET profile_photo = ? WHERE username = ?').run(photoPath, username);
    
    res.json({ success:true, message:'Photo uploaded successfully', photoPath });
  }catch(e){
    console.error('Upload error:', e);
    res.status(500).json({ success:false, message: e.message || 'Terjadi kesalahan' });
  }
});

// JWT authentication middleware
function authenticateJWT(req, res, next){
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if(parts.length!==2 || parts[0] !== 'Bearer') return res.status(401).json({ success:false, message:'Missing token' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  }catch(e){
    return res.status(401).json({ success:false, message:'Invalid token' });
  }
}

// Require admin middleware (only allow 'admin' and 'admin2')
function requireAdminJWT(req, res, next){
  // Ensure JWT is valid first
  authenticateJWT(req, res, function(){
    try{
      const username = req.user && req.user.username;
      if(username === 'admin' || username === 'admin2') return next();
      return res.status(403).json({ success:false, message: 'Admin privileges required' });
    }catch(e){
      return res.status(403).json({ success:false, message: 'Admin privileges required' });
    }
  });
}

// Admin-only check endpoint (frontend can call to verify)
app.get('/api/admin/check', authenticateJWT, (req,res)=>{
  const username = req.user && req.user.username;
  res.json({ success:true, isAdmin: (username === 'admin' || username === 'admin2'), username });
});

// Example protected admin action endpoint
app.post('/api/admin/protected', requireAdminJWT, (req,res)=>{
  // perform admin-only action here (placeholder)
  res.json({ success:true, message: 'Admin action permitted', user: req.user });
});

// Migrate client localStorage export into server DB
app.post('/api/migrate', requireAdminJWT, (req,res)=>{
  const { projects, project_areas, shipments } = req.body || {};
  if(!projects || !project_areas) return res.status(400).json({ success:false, message:'projects and project_areas required' });
  try{
    // Insert projects (ignore duplicates)
    const getProject = db.prepare('SELECT id FROM projects WHERE name = ?');
    const insertProject = db.prepare('INSERT INTO projects (name, period) VALUES (?, ?)');
    const insertArea = db.prepare('INSERT INTO areas (project_id, name) VALUES (?, ?)');
    const insertItem = db.prepare('INSERT INTO items (area_id, name, volume, unit) VALUES (?, ?, ?, ?)');

    const projectIdMap = {};
    for(const p of projects){
      const existing = getProject.get(p.name);
      if(existing){ projectIdMap[p.name] = existing.id; continue; }
      const info = insertProject.run(p.name, p.period || '');
      projectIdMap[p.name] = info.lastInsertRowid;
    }

    // Insert areas and items
    for(const [projName, areas] of Object.entries(project_areas || {})){
      const pid = projectIdMap[projName];
      if(!pid) continue;
      for(const a of areas){
        // insert area if not exists
        const existingArea = db.prepare('SELECT id FROM areas WHERE project_id = ? AND name = ?').get(pid, a.name);
        let areaId;
        if(existingArea) areaId = existingArea.id;
        else {
          const infoA = insertArea.run(pid, a.name);
          areaId = infoA.lastInsertRowid;
        }
        // items may be strings or objects
        const itemsArr = Array.isArray(a.items) ? a.items : [];
        for(const it of itemsArr){
          let name = it && it.name ? it.name : (typeof it === 'string' ? it : null);
          const volume = it && it.volume ? it.volume : '';
          const unit = it && it.unit ? it.unit : '';
          if(!name) continue;
          // avoid duplicate items by name within area
          const existsItem = db.prepare('SELECT id FROM items WHERE area_id = ? AND name = ?').get(areaId, name);
          if(existsItem) continue;
          insertItem.run(areaId, name, volume, unit);
        }
      }
    }

    // Optionally import shipments as projects if names missing
    if(Array.isArray(shipments)){
      const getProjectByName = db.prepare('SELECT id FROM projects WHERE name = ?');
      for(const s of shipments){
        if(!s.project) continue;
        if(!projectIdMap[s.project]){
          const existing = getProjectByName.get(s.project);
          if(existing) projectIdMap[s.project] = existing.id;
          else {
            const info = insertProject.run(s.project, '');
            projectIdMap[s.project] = info.lastInsertRowid;
          }
        }
      }
    }

    res.json({ success:true, message:'Migration complete', projectsImported: Object.keys(projectIdMap).length });
  }catch(e){
    console.error('Migration error:', e);
    res.status(500).json({ success:false, message:'Migration failed' });
  }
});

// Projects CRUD
app.get('/api/projects', (req,res)=>{
  try{
    const rows = db.prepare('SELECT id, name, period, created_at FROM projects ORDER BY id DESC').all();
    res.json({ success:true, projects: rows });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.post('/api/projects', requireAdminJWT, (req,res)=>{
  const { name, period } = req.body || {};
  if(!name) return res.status(400).json({ success:false, message: 'Nama project diperlukan' });
  try{
    const info = db.prepare('INSERT INTO projects (name, period) VALUES (?, ?)').run(name, period || '');
    const project = db.prepare('SELECT id, name, period, created_at FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success:true, project });
  }catch(e){
    if(e.message && e.message.includes('UNIQUE')) return res.status(400).json({ success:false, message:'Project sudah ada' });
    res.status(500).json({ success:false, message:'Terjadi kesalahan' });
  }
});

app.put('/api/projects/:id', requireAdminJWT, (req,res)=>{
  const id = parseInt(req.params.id);
  const { name, period } = req.body || {};
  if(!id) return res.status(400).json({ success:false, message:'Project id diperlukan' });
  try{
    db.prepare('UPDATE projects SET name = ?, period = ? WHERE id = ?').run(name, period || '', id);
    const project = db.prepare('SELECT id, name, period, created_at FROM projects WHERE id = ?').get(id);
    res.json({ success:true, project });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.delete('/api/projects/:id', requireAdminJWT, (req,res)=>{
  const id = parseInt(req.params.id);
  if(!id) return res.status(400).json({ success:false, message:'Project id diperlukan' });
  try{
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    res.json({ success:true, message:'Project dihapus' });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

// Areas CRUD
app.get('/api/projects/:projectId/areas', (req,res)=>{
  const projectId = parseInt(req.params.projectId);
  if(!projectId) return res.status(400).json({ success:false, message:'Project id diperlukan' });
  try{
    const rows = db.prepare('SELECT id, project_id, name FROM areas WHERE project_id = ?').all(projectId);
    res.json({ success:true, areas: rows });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.post('/api/projects/:projectId/areas', requireAdminJWT, (req,res)=>{
  const projectId = parseInt(req.params.projectId);
  const { name } = req.body || {};
  if(!projectId || !name) return res.status(400).json({ success:false, message:'Project id dan nama area diperlukan' });
  try{
    const info = db.prepare('INSERT INTO areas (project_id, name) VALUES (?, ?)').run(projectId, name);
    const area = db.prepare('SELECT id, project_id, name FROM areas WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success:true, area });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.put('/api/areas/:areaId', requireAdminJWT, (req,res)=>{
  const areaId = parseInt(req.params.areaId);
  const { name } = req.body || {};
  if(!areaId || !name) return res.status(400).json({ success:false, message:'Area id dan nama diperlukan' });
  try{
    db.prepare('UPDATE areas SET name = ? WHERE id = ?').run(name, areaId);
    const area = db.prepare('SELECT id, project_id, name FROM areas WHERE id = ?').get(areaId);
    res.json({ success:true, area });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.delete('/api/areas/:areaId', requireAdminJWT, (req,res)=>{
  const areaId = parseInt(req.params.areaId);
  if(!areaId) return res.status(400).json({ success:false, message:'Area id diperlukan' });
  try{
    db.prepare('DELETE FROM areas WHERE id = ?').run(areaId);
    res.json({ success:true, message:'Area dihapus' });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

// Items CRUD
app.get('/api/areas/:areaId/items', (req,res)=>{
  const areaId = parseInt(req.params.areaId);
  if(!areaId) return res.status(400).json({ success:false, message:'Area id diperlukan' });
  try{
    const rows = db.prepare('SELECT id, area_id, name, volume, unit FROM items WHERE area_id = ?').all(areaId);
    res.json({ success:true, items: rows });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.post('/api/areas/:areaId/items', requireAdminJWT, (req,res)=>{
  const areaId = parseInt(req.params.areaId);
  const { name, volume, unit } = req.body || {};
  if(!areaId || !name) return res.status(400).json({ success:false, message:'Area id dan nama item diperlukan' });
  try{
    const info = db.prepare('INSERT INTO items (area_id, name, volume, unit) VALUES (?, ?, ?, ?)').run(areaId, name, volume || '', unit || '');
    const item = db.prepare('SELECT id, area_id, name, volume, unit FROM items WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success:true, item });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.put('/api/items/:itemId', requireAdminJWT, (req,res)=>{
  const itemId = parseInt(req.params.itemId);
  const { name, volume, unit } = req.body || {};
  if(!itemId || !name) return res.status(400).json({ success:false, message:'Item id dan nama diperlukan' });
  try{
    db.prepare('UPDATE items SET name = ?, volume = ?, unit = ? WHERE id = ?').run(name, volume || '', unit || '', itemId);
    const item = db.prepare('SELECT id, area_id, name, volume, unit FROM items WHERE id = ?').get(itemId);
    res.json({ success:true, item });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

app.delete('/api/items/:itemId', requireAdminJWT, (req,res)=>{
  const itemId = parseInt(req.params.itemId);
  if(!itemId) return res.status(400).json({ success:false, message:'Item id diperlukan' });
  try{
    db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    res.json({ success:true, message:'Item dihapus' });
  }catch(e){ res.status(500).json({ success:false, message:'Terjadi kesalahan' }); }
});

// 2FA: Generate secret and provide QR code (user must verify to enable)
app.post('/api/2fa/generate', authenticateJWT, async (req,res)=>{
  try{
    const username = req.user.username;
    const user = db.prepare('SELECT id, email FROM users WHERE username = ?').get(username);
    if(!user) return res.status(404).json({ success:false, message:'User not found' });

    const secret = speakeasy.generateSecret({ name: `KANS (${username})` });
    // store secret (not enabled yet)
    db.prepare('UPDATE users SET twofa_secret = ?, twofa_enabled = 0 WHERE id = ?').run(secret.base32, user.id);

    const otpauth = secret.otpauth_url;
    const qrData = await qrcode.toDataURL(otpauth);
    res.json({ success:true, secret: secret.base32, otpauth, qrData });
  }catch(e){
    res.status(500).json({ success:false, message:'Terjadi kesalahan' });
  }
});

// 2FA: Verify one-time code and enable 2FA
app.post('/api/2fa/verify', authenticateJWT, (req,res)=>{
  const { token } = req.body || {};
  if(!token) return res.status(400).json({ success:false, message: 'Token diperlukan' });
  try{
    const username = req.user.username;
    const user = db.prepare('SELECT id, twofa_secret FROM users WHERE username = ?').get(username);
    if(!user || !user.twofa_secret) return res.status(400).json({ success:false, message:'2FA belum di-generate' });

    const ok = speakeasy.totp.verify({ secret: user.twofa_secret, encoding: 'base32', token, window:1 });
    if(!ok) return res.status(400).json({ success:false, message:'Kode 2FA tidak valid' });

    db.prepare('UPDATE users SET twofa_enabled = 1 WHERE id = ?').run(user.id);
    res.json({ success:true, message: '2FA berhasil diaktifkan' });
  }catch(e){
    res.status(500).json({ success:false, message:'Terjadi kesalahan' });
  }
});

// 2FA login verification: exchange username + TOTP for JWT
app.post('/api/2fa/login-verify', async (req,res)=>{
  const { username, token } = req.body || {};
  if(!username || !token) return res.status(400).json({ success:false, message: 'Username dan token diperlukan' });
  try{
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if(!user) return res.status(404).json({ success:false, message:'User not found' });
    if(!user.twofa_enabled) return res.status(400).json({ success:false, message:'2FA tidak diaktifkan' });

    const ok = speakeasy.totp.verify({ secret: user.twofa_secret, encoding: 'base32', token, window:1 });
    if(!ok) return res.status(401).json({ success:false, message:'Kode 2FA salah' });

    const jwtToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success:true, message: 'Login sukses', token: jwtToken, username: user.username });
  }catch(e){
    res.status(500).json({ success:false, message:'Terjadi kesalahan' });
  }
});

// Forgot password - send reset token via email
app.post('/api/forgot-password', async (req,res)=>{
  const { email } = req.body || {};
  if(!email) return res.status(400).json({ success:false, message: 'Email diperlukan' });

  try{
    const stmt = db.prepare('SELECT id, username FROM users WHERE email = ?');
    const user = stmt.get(email);
    if(!user) return res.status(404).json({ success:false, message: 'Email tidak ditemukan' });

    const token = generateResetToken();
    const expiresIn = Date.now() + 3600000; // 1 hour

    const updateStmt = db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?');
    updateStmt.run(token, expiresIn, email);

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/index.html?reset_token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@kans.local',
      to: email,
      subject: 'KANS - Password Reset Request',
      html: `
        <h2>Reset Password Request</h2>
        <p>Hi ${user.username},</p>
        <p>Someone requested a password reset for your account. If it wasn't you, ignore this email.</p>
        <p><strong>Reset Token (valid for 1 hour):</strong></p>
        <p style="background:#f5f5f5; padding:10px; border-radius:5px; font-family:monospace; word-break:break-all;">${token}</p>
        <p>Or <a href="${resetLink}">click here to reset</a> (if frontend supports it).</p>
        <p>Do not share this token with anyone.</p>
        <p>Best regards,<br>KANS Team</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if(err){
        console.error('Email send error:', err);
        // Return success anyway (fail-open for UX), but log the error
        res.json({ success:true, message: 'Reset email sent (check spam folder)' });
      } else {
        console.log('Email sent:', info.response);
        res.json({ success:true, message: 'Reset token telah dikirim ke email Anda' });
      }
    });
  }catch(e){
    console.error('Forgot password error:', e);
    res.status(500).json({ success:false, message: 'Terjadi kesalahan' });
  }
});

// Reset password
app.post('/api/reset-password', async (req,res)=>{
  const { token, new_password } = req.body || {};
  if(!token || !new_password) return res.status(400).json({ success:false, message: 'Token dan password baru diperlukan' });

  // Check password strength
  const pwCheck = validatePasswordStrength(new_password);
  if(!pwCheck.ok) return res.status(400).json({ success:false, message: pwCheck.msg });

  try{
    const stmt = db.prepare('SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > ?');
    const user = stmt.get(token, Date.now());
    if(!user) return res.status(401).json({ success:false, message: 'Token tidak valid atau kadaluarsa' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password, salt);

    const updateStmt = db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?');
    updateStmt.run(hash, user.id);

    res.json({ success:true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
  }catch(e){
    res.status(500).json({ success:false, message: 'Terjadi kesalahan' });
  }
});

// Start server with HTTPS or HTTP
if(USE_HTTPS && fs.existsSync(SSL_KEY_FILE) && fs.existsSync(SSL_CERT_FILE)){
  try{
    const key = fs.readFileSync(SSL_KEY_FILE);
    const cert = fs.readFileSync(SSL_CERT_FILE);
    const options = { key, cert };
    https.createServer(options, app).listen(PORT, ()=>{
      console.log(`✅ KANS auth backend listening on https://localhost:${PORT}`);
    });
  }catch(e){
    console.warn(`⚠️  HTTPS error: ${e.message}. Falling back to HTTP`);
    app.listen(PORT, ()=>{
      console.log(`KANS auth backend listening on http://localhost:${PORT}`);
    });
  }
} else {
  if(USE_HTTPS){
    console.warn('⚠️  HTTPS enabled but SSL certificates not found');
    console.warn(`   Create certificates with: openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes`);
  }
  app.listen(PORT, ()=>{
    console.log(`KANS auth backend listening on http://localhost:${PORT}`);
  });
}
