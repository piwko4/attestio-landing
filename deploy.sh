#!/bin/bash
# ShieldGuide Landing Page - Quick Deploy Script
# Run this to deploy to GitHub Pages

set -e

REPO_NAME="shieldguide-landing"

echo "🛡️ ShieldGuide Landing Page Deployment"
echo "======================================="

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not installed. Install with: sudo apt install gh"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged into GitHub. Run: gh auth login"
    exit 1
fi

cd "$(dirname "$0")"

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: ShieldGuide landing page"
fi

# Create repo and push
echo "📤 Creating GitHub repo and pushing..."
gh repo create "$REPO_NAME" --public --source=. --push 2>/dev/null || git push origin main

# Enable GitHub Pages
echo "🌐 Enabling GitHub Pages..."
gh api repos/:owner/$REPO_NAME/pages -X POST -f source='{"branch":"main","path":"/"}' 2>/dev/null || true

# Get the URL
PAGES_URL=$(gh api repos/:owner/$REPO_NAME/pages --jq '.html_url' 2>/dev/null || echo "https://piwko4.github.io/$REPO_NAME")

echo ""
echo "✅ Deployed!"
echo "🔗 Live at: $PAGES_URL"
echo ""
echo "⚠️  Before sharing publicly:"
echo "   1. Set up Formspree (https://formspree.io) and update script.js"
echo "   2. Remove noindex meta tag from index.html"
echo "   3. Add your domain if you have one"
