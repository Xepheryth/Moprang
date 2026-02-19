# Contributing to KANS (MOPRANG)

Terima kasih telah tertarik untuk berkontribusi pada project KANS! Panduan ini akan membantu Anda memulai.

## 🚀 Getting Started

### 1. Fork & Clone Repository
```bash
# Fork repository di GitHub
# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/KANS.git
cd KANS
cd "Web Monitoring"
```

### 2. Setup Development Environment
```bash
# Install backend dependencies
cd backend
npm install

# Setup .env file
cp .env.example .env
# Edit .env dengan configuration Anda
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## 📝 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes (formatting, etc)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Tests
- `chore` - Build, dependencies, tools

### Examples
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(shipment): resolve progress calculation error"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): simplify error handling middleware"
```

## 🔍 Code Style

### JavaScript
- Use ES6+ syntax
- 4 spaces indentation
- Semicolons at end of statements
- Use meaningful variable names
- Add comments for complex logic

```javascript
// ❌ Bad
function calc(a,b){return a+b;}

// ✅ Good
function calculateTotal(quantity, price) {
  // Calculate total with tax
  const subtotal = quantity * price;
  const tax = subtotal * 0.1;
  return subtotal + tax;
}
```

### HTML/CSS
- Use semantic HTML5
- Consistent indentation (2-4 spaces)
- Class names in kebab-case
- CSS properties in logical order

```css
/* ✅ Good */
.shipment-card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fffacd;
}
```

## 🧪 Testing

Sebelum submit PR:

1. **Test di browser** - Pastikan fitur berjalan di semua browser modern
2. **Check console** - Tidak ada error di browser console
3. **Test di backend** - Jalankan dari terminal dan check logs
4. **Test input validation** - Coba dengan edge cases
5. **Test authentication** - Pastikan JWT & session berjalan

## 📋 Pull Request Checklist

Sebelum submit PR, pastikan:

- [ ] Code mengikuti style guide
- [ ] Tidak ada console errors
- [ ] Feature sudah tested
- [ ] Documentation updated (jika perlu)
- [ ] Commit messages clear dan descriptive
- [ ] No sensitive data di commit (passwords, tokens, dll)
- [ ] `.env` files tidak di-commit
- [ ] Baseline changes di feature branch

## 🐛 Bug Report

Jika menemukan bug:

1. Check apakah bug sudah dilaporkan (cek Issues)
2. Deskripsi jelas tentang bug
3. Steps untuk reproduce
4. Expected vs actual behavior
5. Browser & OS yang digunakan
6. Screenshots jika perlu

Template:
```markdown
**Describe the bug:**
[Clear description of the bug]

**Steps to reproduce:**
1. Go to...
2. Click...
3. See error...

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
```

## 💡 Feature Request

Untuk suggest fitur baru:

1. Deskripsi use case
2. Bagaimana ini solve problem
3. Possible implementation

Template:
```markdown
**Is your feature request related to a problem?**
Yes/No. Describe...

**Describe the solution you'd like:**
[Clear description]

**Describe alternatives you've considered:**
[Other options]
```

## 📚 Documentation

Jika menambah fitur baru, update documentation:

1. Update README.md features section
2. Add section di START_HERE.md jika perlu
3. Create detailed guide jika feature kompleks
4. Add comments di code

## 🔐 Security

- Jangan commit sensitive data (passwords, tokens, keys)
- Report security vulnerabilities via private email (jangan di public issue)
- Use HTTPS di production
- Validate semua input
- Use environment variables untuk secrets

## ❓ Questions?

- Check existing documentation
- Search dalam issues di GitHub
- Create discussion issue untuk questions

## 📄 License

Dengan berkontribusi, Anda agree bahwa contributions Anda akan di-license di bawah MIT License.

---

**Terima kasih telah berkontribusi! 🙏**
