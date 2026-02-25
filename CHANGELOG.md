# Changelog

Semua perubahan notable pada project KANS akan didokumentasikan di file ini.

Format file ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-19

### 🎉 Initial Release

Project KANS (MOPRANG) - Sistem Terpadu Monitoring Pengiriman Barang sudah siap untuk public release.

### ✨ Added

**Authentication & Security**
- User registration dan login system
- JWT (JSON Web Token) untuk session management
- Password hashing dengan bcryptjs
- Email-based password reset dengan secure token
- Google OAuth 2.0 integration
- Two-Factor Authentication (2FA/TOTP) dengan QR code
- User profile management dengan foto upload
- HTTPS/SSL support untuk secure communication
- Admin role dan permission management

**Shipment Management**
- Create, read, update, delete (CRUD) untuk projects
- Area management per project
- Item management dengan volume & realisasi tracking
- Real-time progress monitoring (0-100%)
- Vendor dan user assignment untuk shipments
- Batch operations untuk multiple items

**User Interface**
- Responsive design dengan mobile support
- Dashboard dengan project cards dan progress bars
- Project detail view dengan nested areas dan items
- Search functionality untuk quick shipment lookup
- Filter options berdasarkan project dan area
- User-friendly navigation dengan breadcrumbs
- Yellow theme dengan smooth animations dan transitions
- Profile page untuk user information & photo

**Database & Storage**
- SQLite database untuk data persistence
- LocalStorage untuk caching dan offline support
- Users database dengan secure credential storage
- Reset tokens dengan expiration management
- Activity logging (prepared untuk future use)

**Developer Experience**
- Comprehensive documentation
- GitHub issue templates (bug report, feature request)
- Pull request template
- Contributing guidelines
- Security policy documentation
- Code of Conduct
- GitHub Actions workflow untuk setup verification
- Backend .env.example untuk easy configuration

### 📁 Project Structure

```
KANS Web Monitoring/
├── Front.html                          # Main frontend
├── script.js                           # Frontend logic
├── styles.css                          # Styling
├── index.html, area-detail.html, etc   # Additional pages (index.html is entry point)
├── backend/server.js                   # Express server
├── backend/package.json                # Node dependencies
├── README.md                           # Main documentation
├── CONTRIBUTING.md                     # Contribution guide
├── SECURITY.md                         # Security policy
├── .gitignore                          # Git ignore rules
├── LICENSE                             # MIT License
└── media/                              # Assets folder
```

### 📋 Features Breakdown

#### Frontend (HTML/CSS/JavaScript)
- 740+ lines of organized JavaScript
- Responsive CSS dengan yellow theme (#FFD700)
- Clean HTML5 structure
- Dynamic form handling
- Real-time search & filtering
- Modal dialogs untuk actions
- Progress bar animations

#### Backend (Node.js/Express)
- 770+ lines of organized server code
- RESTful API endpoints
- HTTPS support dengan SSL/TLS
- CORS configuration
- User authentication endpoints
- Email service integration (Nodemailer)
- Database operations dengan better-sqlite3
- Error handling & validation
- JWT middleware untuk protected routes

#### Database (SQLite)
- Users table dengan hashed passwords
- Projects table
- Areas table
- Items table (shipments detail)
- Reset tokens table
- 2FA secrets storage

### 🔐 Security Features

- Bcryptjs password hashing (salted, 10 rounds)
- Crypto-generated 64-character reset tokens
- 1-hour token expiration untuk password reset
- One-time token usage enforcement
- Email verification untuk password reset
- JWT dengan configurable secret
- HTTPS/SSL untuk encrypted communication
- CORS protection
- Input validation & sanitization
- SQL injection prevention (parameterized queries)

### 📚 Documentation

- **README.md** - Comprehensive project overview, installation, usage guide
- **START_HERE.md** - Quick start guide untuk rapid setup
- **SYSTEM_ARCHITECTURE.md** - Technical architecture documentation
- **CONTRIBUTING.md** - Guidelines untuk contributors
- **SECURITY.md** - Security policy dan best practices
- **CODE_OF_CONDUCT.md** - Community standards
- **GITHUB_PUSH_GUIDE.md** - Setup guide untuk GitHub
- **CHANGELOG.md** - Versi history (file ini)
- **PROFILE_PHOTO_FEATURE.md** - User photo upload guide
- **EMAIL_PASSWORD_RESET_COMPLETE.md** - Email reset setup
- **HTTPS_SETUP_GUIDE.md** - HTTPS/SSL configuration
- **TESTING_CHECKLIST.md** - QA testing scenarios
- **DEVELOPER_REFERENCE.md** - Developer API reference

### 🛠️ Technology Stack

**Frontend**
- HTML5
- CSS3 (grid, flexbox, animations)
- JavaScript ES6+
- LocalStorage API

**Backend**
- Node.js
- Express.js v4.18.2
- Better-SQLite3
- Bcryptjs v2.4.3
- JWT (jsonwebtoken v9.0.0)
- Nodemailer v6.9.7
- Speakeasy v2.0.0 (TOTP)
- QRCode v1.5.1
- Passport.js v0.6.0
- Multer v1.4.5 (file upload)

**Infrastructure**
- HTTPS/TLS/SSL
- CORS
- Express-session
- Dotenv (environment variables)

### 📈 Performance

- Lightweight design dengan minimal dependencies
- Fast SQLite queries
- LocalStorage caching untuk reduced API calls
- Optimized CSS animations
- Responsive images dengan proper sizing
- Efficient DOM updates

### 🐛 Known Limitations

- User data cleared on browser refresh (unless database query used)
- Single-page app tanpa persistence layer untuk session
- No real-time updates (polling-based jika perlu)
- Profile photo stored locally (no cloud CDN)
- No offline-first capability (planned untuk v1.1)

### 🔮 Planned Improvements

Untuk version mendatang:
- [ ] Unit tests & integration tests
- [ ] End-to-end testing (Cypress/Playwright)
- [ ] Real-time updates dengan WebSocket
- [ ] Advanced reporting & analytics
- [ ] Mobile app (React Native)
- [ ] Offline-first capability
- [ ] Push notifications
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Advanced role-based access control (RBAC)
- [ ] Audit logging
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Cloud deployment guides

---

## [Unreleased] - TBD

Fitur yang sedang dikembangkan untuk release mendatang:

### Planned
- [ ] Automated testing framework
- [ ] Performance profiling & optimization
- [ ] Advanced data export (CSV, PDF)
- [ ] Batch import untuk items
- [ ] Notification system
- [ ] Dashboard widgets customization
- [ ] Calendar view untuk timeline
- [ ] Map visualization untuk locations
- [ ] Mobile-optimized UI improvements

---

## Version Numbering

Project mengikuti [Semantic Versioning](https://semver.org/):

- **MAJOR** version ketika membuat incompatible API changes
- **MINOR** version ketika add functionality dalam backward-compatible manner
- **PATCH** version ketika buat bug fixes

Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

---

## Contributing

Untuk submit changes:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Open Pull Request

Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lengkap.

---

## Security

Jika Anda menemukan security vulnerability:

**Jangan** membuat public issue. Lihat [SECURITY.md](SECURITY.md) untuk cara reporting yang aman.

---

## License

Project KANS dilisensikan di bawah [MIT License](LICENSE).

---

## Support

Untuk questions atau issues:

1. Check documentation di repository
2. Search existing GitHub issues
3. Create new issue jika tidak ditemukan
4. Read TESTING_CHECKLIST.md untuk troubleshooting

---

<div align="center">

**KANS - MOPRANG** | Sistem Terpadu Monitoring Pengiriman Barang

Made with ❤️ | February 2026

</div>

---

## References

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/)
