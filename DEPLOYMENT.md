# Attestio Landing Page — Deployment Guide

## 1. Set Up Formspree (Email Capture)

Formspree is the form backend. Free tier gives **50 submissions/month** — plenty for launch.

### Step-by-step

1. Go to **https://formspree.io** and create an account (email or GitHub).
2. Click **New Form** → name it `Attestio Leads`.
3. Copy your **form endpoint** — it looks like:
   ```
   https://formspree.io/f/xAbCdEfG
   ```
4. Open `script.js` and replace the placeholder on **line 12**:
   ```js
   const FORM_ENDPOINT = 'https://formspree.io/f/xAbCdEfG';
   ```
5. Open `index.html` and update the `<form>` tag's `action` attribute to match:
   ```html
   <form id="lead-form" class="lead-form" action="https://formspree.io/f/xAbCdEfG" method="POST">
   ```
   *(The `action` is a fallback for no-JS browsers; the JS handles submission via `fetch`.)*
6. **Test it.** Submit the form and verify the email arrives at your Formspree inbox.

### Formspree settings to configure

| Setting | Recommended value |
|---------|-------------------|
| Email notifications | Your inbox (e.g. `scs@knightdivisiontactical.com`) |
| reCAPTCHA | Enable (Formspree dashboard → Form → Settings) |
| Allowed domains | Your production domain (e.g. `attestio.io`) |
| Auto-response | Optional: set up a "Thanks, here's your guide" auto-reply with the PDF link |

### Upgrading later

When you outgrow 50 submissions/month, either:
- Upgrade Formspree ($8/mo for 1,000 submissions)
- Swap to ConvertKit/Mailchimp and change `FORM_ENDPOINT` to their API URL

---

## 2. Hosting Options

### Option A: GitHub Pages (free, simplest)

```bash
# In the landing-page directory
git init
git add .
git commit -m "Attestio landing page"
gh repo create attestio-landing --public --source=. --push
```

Then: **Repo → Settings → Pages → Source: main branch, root folder**.

Live at: `https://<username>.github.io/attestio-landing/`

### Option B: Netlify (free tier, recommended)

1. Go to https://app.netlify.com
2. Drag-and-drop the `landing-page/` folder onto the deploy area
3. Done — you get a `*.netlify.app` URL instantly

**Or connect via Git:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd landing-page
netlify deploy --prod --dir=.
```

Netlify advantages: automatic HTTPS, deploy previews, form handling (alternative to Formspree), branch deploys.

### Option C: Vercel (free tier)

```bash
npm install -g vercel
cd landing-page
vercel --prod
```

### Option D: Cloudflare Pages (free tier)

Connect your GitHub repo at https://pages.cloudflare.com — auto-deploys on push.

---

## 3. Custom Domain Setup

### Buy a domain

Recommended registrars: Cloudflare Registrar, Namecheap, Google Domains.

Suggested: `attestio.io`, `attestio.com`, `getattestio.com`

### DNS configuration

Wherever you host, you'll need to add DNS records:

**For Netlify:**
```
CNAME  www   →  <your-site>.netlify.app
A      @     →  75.2.60.5
```

**For GitHub Pages:**
```
CNAME  www   →  <username>.github.io
A      @     →  185.199.108.153
A      @     →  185.199.109.153
A      @     →  185.199.110.153
A      @     →  185.199.111.153
```

**For Vercel:**
```
CNAME  www   →  cname.vercel-dns.com
A      @     →  76.76.21.21
```

### SSL/TLS

All three platforms provide **free automatic HTTPS**. No action needed once DNS propagates (usually < 1 hour).

---

## 4. Pre-Launch Checklist

- [ ] Replace `FORMSPREE_ID` in `script.js` and `index.html`
- [ ] Test form submission (check Formspree inbox)
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`
- [ ] Set up Formspree auto-response with PDF download link
- [ ] Configure allowed domains in Formspree dashboard
- [ ] Enable reCAPTCHA in Formspree (optional but recommended)
- [ ] Set up Google Analytics / GA4 (add gtag snippet to `<head>`)
- [ ] Buy and configure custom domain
- [ ] Test on mobile (Chrome DevTools → device toolbar)
- [ ] Run Lighthouse audit (aim for 90+ on all scores)
- [ ] Add a real Privacy Policy and Terms of Service page

---

## 5. File Overview

| File | Purpose |
|------|---------|
| `index.html` | Landing page markup — form, hero, FAQ, modal |
| `styles.css` | All styling (responsive, modal, error toast) |
| `script.js` | Form submission (Formspree), FAQ accordion, modal, smooth scroll |
| `DEPLOYMENT.md` | This file |

The `FORM_ENDPOINT` variable at the top of `script.js` is the **only thing** you need to change for the form to go live.
