# We Care 4 'all' — Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Add the Hero Video
Place `hero.mp4` at:
```
public/assets/video/hero.mp4
```
(Already included in this package)

### 4. Add Logo Images
Place these in `public/assets/img/logo/`:
```
final.png        ← Main logo (shown on light navbar)
logo-light.png   ← White version (shown on dark backgrounds)
euro_logo.jpeg   ← Euro Cert badge (shown in footer + hero)
```

### 5. Start Development Server
```bash
npm run dev
```
Open: http://localhost:5173

---

## 🎨 How to Change the Site Theme

**ONE FILE to change all colors across the entire website:**

```
src/theme.js
```

### Example — Change Primary Color from Green to Blue:
```js
// In src/theme.js, find COLORS object and change:
primary:        "#047857",   // ← Change this green
primaryDark:    "#065f46",   // ← And this
primaryLight:   "#059669",   // ← And this
primaryBg:      "#f0fdf4",   // ← Light bg tint
primaryBorder:  "#86efac",   // ← Border color

// To blue:
primary:        "#1d4ed8",
primaryDark:    "#1e3a8a",
primaryLight:   "#2563eb",
primaryBg:      "#eff6ff",
primaryBorder:  "#93c5fd",
```

### What Updates Automatically:
- ✅ All buttons (primary, outline, white)
- ✅ All section badges and labels
- ✅ Navbar active link color
- ✅ Footer accent colors
- ✅ Service card borders
- ✅ Specialty chip colors
- ✅ Stats band accent colors
- ✅ Trust section cards
- ✅ Ticker bar background
- ✅ Hero glow effects
- ✅ CTA banner gradient
- ✅ Form focus colors
- ✅ All hover effects

### Change Font:
```js
// In src/theme.js:
export const FONTS = {
  heading: "'Playfair Display', Georgia, serif",  // ← Change heading font
  body:    "'Inter', system-ui, sans-serif",       // ← Change body font
};
// Also update the Google Fonts URL in global.css
```

---

## 📁 Project Structure

```
src/
├── theme.js              ← 🎨 SINGLE SOURCE — ALL COLORS & FONTS HERE
├── App.jsx               ← All routes
├── main.jsx              ← Entry point
├── i18n.js               ← Multi-language setup
├── styles/
│   └── global.css        ← Base CSS reset + font imports
├── components/
│   ├── Navbar.jsx        ← Uses theme.js
│   ├── Footer.jsx        ← Uses theme.js
│   ├── Layout.jsx        ← Navbar + page + Footer
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx   ← Global auth state
├── services/
│   └── api.js            ← All API calls
├── locales/
│   ├── en.json           ← English
│   ├── ta.json           ← Tamil
│   └── hi.json           ← Hindi
└── pages/
    ├── public/
    │   ├── Home.jsx              ← Video hero + all sections
    │   ├── AboutUs.jsx           ← Full about page
    │   ├── Contact.jsx           ← Contact + FAQ
    │   ├── HealthcareProvider.jsx ← Services + specialties
    │   └── PartnerWithUs.jsx     ← Hospital empanelment
    ├── auth/
    │   └── Login.jsx             ← OTP + staff login
    ├── patient/Dashboard.jsx     ← Phase 2 placeholder
    ├── doctor/Dashboard.jsx      ← Phase 4 placeholder
    └── admin/Dashboard.jsx       ← Phase 3 placeholder
```

---

## 🔑 API Keys Location

All API keys go in `wecare4all-backend/.env`:

| Key | Purpose | When |
|-----|---------|------|
| `SENDGRID_API_KEY` | Email OTP sending | Before go-live |
| `SMS_API_KEY` | Mobile OTP | Phase 2 |
| `RAZORPAY_KEY_ID` + `SECRET` | India payments | Phase 3 |
| `STRIPE_PUBLIC_KEY` + `SECRET` | International payments | Phase 3 |
| `VIDEO_APP_ID` + `VIDEO_API_KEY` | Video consultation | Phase 4 |

---

## 🌐 Multi-Language

To add a new language (e.g., Malayalam):
1. Create `src/locales/ml.json` — copy `en.json` and translate
2. In `src/i18n.js` — import and register `ml`
3. In `src/components/Navbar.jsx` — add to `LANGUAGES` array

---

## 📦 Production Build

```bash
npm run build
# Output in: dist/
```
Deploy `dist/` to Vercel, Netlify, or any static host.
