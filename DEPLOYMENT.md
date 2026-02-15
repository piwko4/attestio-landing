# Attestio Website Deployment Guide

## Structure

```
website/
├── index.html          # Homepage (attestio.ai)
├── styles.css          # Homepage styles
├── script.js           # Homepage scripts
├── vercel.json         # Vercel config
├── assets/
│   └── logo.png        # Logo for nav/footer
└── guide/
    ├── index.html      # Lead magnet landing page (attestio.ai/guide)
    ├── styles.css
    ├── script.js
    ├── cmmc-survival-guide.html  # The actual guide content
    ├── logo-simple.jpg
    └── ebook-bg.jpg
```

## URLs

- `https://attestio.ai` → Homepage (company intro, services, CTA)
- `https://attestio.ai/guide` → Lead magnet landing page (email capture + guide download)

## Deployment to Vercel

### Option 1: Via Vercel CLI

```bash
cd ~/clawd/projects/attestio/website
vercel
```

### Option 2: Via Git

1. Push to GitHub repo
2. Connect repo to Vercel
3. Deploy

### Custom Domain Setup

In Vercel dashboard:
1. Go to project settings → Domains
2. Add `attestio.ai`
3. Update DNS at registrar:
   - Add CNAME: `@` → `cname.vercel-dns.com`
   - Or A record: `@` → `76.76.21.21`

## Form Handling

Currently using Formspree for form capture:
- Form ID: `mjgegkoq`
- Submissions go to Formspree dashboard

### TODO: Zoho Email Automation

Set up Zoho Campaigns to:
1. Receive form submissions from Formspree (webhook)
2. Auto-send the guide PDF via email
3. Add subscribers to follow-up sequence

## Testing Locally

```bash
cd ~/clawd/projects/attestio/website
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Checklist Before Launch

- [ ] Test all links work
- [ ] Test form submission
- [ ] Test on mobile
- [ ] Verify logo appears correctly
- [ ] Remove noindex from guide page when ready
- [ ] Connect custom domain

## Notes

- Homepage links to guide page at `/guide`
- Guide page links back to homepage at `../`
- Both share similar visual design (dark + gold)
