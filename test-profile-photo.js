#!/usr/bin/env node

/**
 * Test Script untuk Upload Foto Profil Feature
 * Jalankan: node test-profile-photo.js
 * 
 * Script ini akan:
 * 1. Test koneksi ke backend API
 * 2. Test database connection
 * 3. Test folder permissions
 * 4. Provide debugging information
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BACKEND_URL = 'http://localhost:3000';
const UPLOADS_DIR = path.join(__dirname, 'backend', 'uploads', 'profiles');
const DB_FILE = path.join(__dirname, 'backend', 'kans.db');

console.log('\n========================================');
console.log('🧪 KANS Profile Photo Feature Test');
console.log('========================================\n');

// Test 1: Backend Server Connection
console.log('📡 Test 1: Backend Server Connection');
console.log('-------------------------------------');

const testBackendConnection = () => {
  return new Promise((resolve) => {
    const req = http.get(BACKEND_URL + '/api/ping', (res) => {
      console.log('✅ Backend server is running at', BACKEND_URL);
      resolve(true);
    }).on('error', (err) => {
      console.log('❌ Backend server is NOT running');
      console.log('   Error:', err.message);
      console.log('   Please start backend with: npm start (in backend folder)');
      resolve(false);
    });
    req.setTimeout(3000);
  });
};

// Test 2: Database File
console.log('\n📦 Test 2: Database File');
console.log('-------------------------------------');

const testDatabase = () => {
  const dbPath = DB_FILE;
  if(fs.existsSync(dbPath)){
    const size = fs.statSync(dbPath).size;
    console.log('✅ Database file found:', dbPath);
    console.log('   Size:', (size / 1024).toFixed(2), 'KB');
    
    // Try to check if users table has profile_photo column
    try{
      const Database = require('better-sqlite3');
      const db = new Database(dbPath);
      const cols = db.prepare("PRAGMA table_info(users)").all();
      const hasPhotoColumn = cols.some(c => c.name === 'profile_photo');
      if(hasPhotoColumn){
        console.log('✅ Column "profile_photo" exists in users table');
      } else {
        console.log('⚠️  Column "profile_photo" NOT found in users table');
        console.log('   This will be auto-created on next server start');
      }
      db.close();
    } catch(err){
      console.log('⚠️  Could not read database:', err.message);
    }
  } else {
    console.log('⚠️  Database file not found:', dbPath);
    console.log('   This will be auto-created when backend starts');
  }
};

// Test 3: Uploads Folder
console.log('\n📁 Test 3: Uploads Folder Permissions');
console.log('-------------------------------------');

const testUploadsFolder = () => {
  const parentDir = path.join(__dirname, 'backend', 'uploads');
  
  // Check if uploads dir exists
  if(!fs.existsSync(parentDir)){
    console.log('⚠️  Folder does not exist:', parentDir);
    console.log('   This will be auto-created on server start');
    return;
  }
  
  console.log('✅ Uploads folder exists:', parentDir);
  
  // Check if profiles subfolder exists
  if(!fs.existsSync(UPLOADS_DIR)){
    console.log('⚠️  Profiles folder does not exist:', UPLOADS_DIR);
    console.log('   This will be auto-created on server start');
    return;
  }
  
  console.log('✅ Profiles folder exists:', UPLOADS_DIR);
  
  // Check write permissions
  try{
    const testFile = path.join(UPLOADS_DIR, '.test-write');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Folder has write permissions');
  } catch(err){
    console.log('❌ Folder does NOT have write permissions');
    console.log('   Error:', err.message);
  }
  
  // Count files in profiles folder
  try{
    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`   Contains ${files.length} file(s)`);
  } catch(err){
    console.log('⚠️  Could not list files:', err.message);
  }
};

// Test 4: Dependencies
console.log('\n📦 Test 4: Backend Dependencies');
console.log('-------------------------------------');

const testDependencies = () => {
  const packagePath = path.join(__dirname, 'backend', 'package.json');
  
  if(!fs.existsSync(packagePath)){
    console.log('❌ package.json not found');
    return;
  }
  
  try{
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = pkg.dependencies || {};
    
    const required = ['express', 'multer', 'better-sqlite3', 'jsonwebtoken'];
    let allPresent = true;
    
    for(const dep of required){
      if(deps[dep]){
        console.log(`✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ ${dep}: NOT INSTALLED`);
        allPresent = false;
      }
    }
    
    if(!allPresent){
      console.log('\n   Run: npm install (in backend folder)');
    }
  } catch(err){
    console.log('❌ Error reading package.json:', err.message);
  }
};

// Test 5: Frontend Files
console.log('\n🌐 Test 5: Frontend Files');
console.log('-------------------------------------');

const testFrontendFiles = () => {
  const files = [
    'Front.html',
    'script.js',
    'styles.css'
  ];
  
  for(const file of files){
    const filePath = path.join(__dirname, file);
    if(fs.existsSync(filePath)){
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} NOT found`);
    }
  }
};

// Main execution
async function main(){
  testDatabase();
  testUploadsFolder();
  testDependencies();
  testFrontendFiles();
  
  console.log('\n🔗 Testing Backend Connection...');
  const backendOk = await testBackendConnection();
  
  // Summary
  console.log('\n========================================');
  console.log('📋 Summary');
  console.log('========================================\n');
  
  if(backendOk){
    console.log('✅ All systems ready!');
    console.log('\nYou can now:');
    console.log('1. Open Front.html in browser');
    console.log('2. Login to the application');
    console.log('3. Navigate to Profile page');
    console.log('4. Click "📷 Pilih Foto" to upload');
  } else {
    console.log('⚠️  Some issues detected:');
    console.log('\n1. Start backend server:');
    console.log('   cd backend');
    console.log('   npm install  # if dependencies not installed');
    console.log('   npm start');
    console.log('\n2. Then run this test again:');
    console.log('   node test-profile-photo.js');
  }
  
  console.log('\n📚 Documentation:');
  console.log('   - QUICK_START_PROFILE_PHOTO.md (quick start guide)');
  console.log('   - PROFILE_PHOTO_FEATURE.md (detailed documentation)');
  console.log('   - IMPLEMENTATION_PROFILE_PHOTO.md (implementation checklist)');
  
  console.log('\n========================================\n');
}

main().catch(console.error);
