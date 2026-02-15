# Attestio Email Capture Setup

**Time needed:** 5 minutes

## Steps

### 1. Create Formspree Account (2 min)
1. Go to https://formspree.io/register
2. Sign up with email (use your Attestio email if you have one)
3. Verify your email

### 2. Create Form (1 min)
1. Click "New Form"
2. Name it: `Attestio Lead Capture`
3. Copy the form endpoint (looks like: `https://formspree.io/f/xyzabc123`)

### 3. Update Landing Page (1 min)
Edit `index.html` line 137:

**Change:**
```html
<form id="lead-form" class="lead-form" action="https://formspree.io/f/FORMSPREE_ID" method="POST">
```

**To:**
```html
<form id="lead-form" class="lead-form" action="https://formspree.io/f/YOUR_ACTUAL_ID" method="POST">
```

### 4. Test (1 min)
1. Open the landing page locally
2. Submit a test email
3. Check Formspree dashboard for the submission

## What Formspree Captures

The form collects:
- First name
- Last name  
- Email (required)
- Company name
- Company size

All submissions appear in your Formspree dashboard. Free tier: 50 submissions/month.

## Alternative: Web3Forms (no account needed)

If you want zero signup:
1. Go to https://web3forms.com/
2. Enter your email to get an access key
3. Replace the form action with their endpoint

---

**After setup:** Remove `<meta name="robots" content="noindex, nofollow">` from index.html to allow search engines.
