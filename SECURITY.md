# Security Policy

## 🔒 Reporting Security Vulnerabilities

KANS takes security seriously. Jika Anda menemukan security vulnerability, **JANGAN** membuat public issue.

### Cara Report
1. **Email**: Hubungi maintainers melalui email (create issue untuk minta contact info)
2. **GitHub Security Advisory**: Gunakan GitHub's private vulnerability reporting jika tersedia
3. **Do NOT**: Post vulnerability details di public issue

### Response Timeline
- Kami akan acknowledge laporan dalam **24 jam**
- Timeline fix tergantung severity:
  - **Critical**: Diperbaiki dalam 7 hari
  - **High**: Diperbaiki dalam 14 hari  
  - **Medium**: Diperbaiki dalam 30 hari
  - **Low**: Diperbaiki dalam next release

## 🛡️ Security Best Practices

Saat menggunakan KANS:

### Backend Setup
- [ ] Change `JWT_SECRET` ke value yang strong dan random
- [ ] Use environment variables untuk semua sensitive data
- [ ] Jangan commit `.env` file
- [ ] Enable HTTPS di production
- [ ] Regular update dependencies: `npm audit fix`
- [ ] Monitor server logs untuk suspicious activity

### Database
- [ ] Backup database regularly
- [ ] Restrict database file permissions
- [ ] Use parameterized queries (already implemented)

### Frontend
- [ ] Validate semua user input
- [ ] Use Content Security Policy (CSP) headers
- [ ] Keep browser updated
- [ ] Clear sensitive data dari localStorage saat logout

### User Accounts
- [ ] Use strong passwords (minimum 8 characters, mix of upper/lower/numbers/symbols)
- [ ] Enable 2FA jika tersedia
- [ ] Regularly change password
- [ ] Don't reuse passwords across services

## 🚨 Known Issues & Workarounds

Saat ini tidak ada known critical vulnerabilities.

## 📋 Dependency Security

Kami regularly update dependencies:
```bash
npm audit
npm audit fix
```

Jika Anda encounter vulnerability di dependencies:
1. Update dependency ke latest version
2. Run tests
3. Report issue jika patch version tidak fix vulnerability

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Terima kasih telah membantu menjaga KANS tetap aman! 🙏**
