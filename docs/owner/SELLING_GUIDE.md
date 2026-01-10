# Parallax Sales & Distribution Guide

## Quick Start: Revenue in 72 Hours

### 1. Build the Product (30 minutes)

```bash
./scripts/build-all-platforms.sh
```

Test installer on fresh OS before selling!

### 2. Set Up Gumroad (15 minutes)

1. Create account at [gumroad.com](https://gumroad.com)
2. Create product "Parallax Intelligence Platform - Pro License"
3. Price: **$79** (recommended) or $29/month
4. Description:

```
AI-powered OSINT platform for security researchers.

✓ Unlimited AI dork generation
✓ 137 pre-built templates
✓ Unlimited vault storage
✓ Export to PDF/CSV/JSON
✓ Lifetime updates

Requirements: Windows 10+, macOS 10.15+, or Linux
Instant delivery via email.
```

### 3. Generate License Keys

```bash
python scripts/generate-license.py customer@email.com pro
```

Email template:
```
Subject: Your Parallax Pro License

Hi [Name],

Thanks for purchasing Parallax Pro!

License key: PRLX-XXXX-XXXX-XXXX-XXXX

Installation:
1. Download: [GitHub Release Link]
2. Install Parallax
3. Settings → License → Paste key

Questions? Reply to this email.
```

### 4. Launch Marketing (Day 1)

**Reddit** (Best ROI):
- r/OSINT (68k): Tuesday 9 AM EST
- r/cybersecurity (832k): Wednesday 10 AM EST
- r/netsec (1M): Thursday 11 AM EST

Post template:
```
Title: Built an AI-powered OSINT platform

I built Parallax - uses AI (Gemini) to generate Google dorks from natural language.

Features:
- Natural language → dork
- 137 pre-built templates
- Works offline, data stays local
- Export to PDF/CSV

Free version: 10 AI queries/day
Pro: $79 one-time (unlimited)

[Screenshot]
[GitHub link]

Would love feedback!
```

**Twitter/X**:
```
🚀 Just launched Parallax - AI-powered OSINT platform

Intelligence from every angle:
• AI dork generation (Gemini)
• 137 templates included
• Secure local vault
• Works offline

Free: [link]
Pro: $79 one-time

Built with @tauri_apps

[GIF demo]

#OSINT #CyberSecurity
```

**Direct Outreach** (Highest Conversion):
- Find 50 OSINT practitioners on Twitter
- Email security researchers
- Contact bug bounty hunters
- 20% response rate, 10% conversion expected

### 5. Financial Projections

**Conservative (Month 1)**: $4,000 (50 sales)
**Realistic**: $8,000 (100 sales)
**Optimistic**: $16,000 (200 sales)

Gumroad takes 10% → Net $71 per $79 sale

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 10 AI/day, 50 dork limit, Templates |
| Pro | $79 | Unlimited everything, Export, Support |
| Team | $299 | 5 licenses, Team features |

**Recommendation**: Start with $79 one-time. Easier to sell than subscription.

## Support Strategy

**Free tier**: 48-hour email response
**Pro tier**: 24-hour response
**Critical bugs**: 4-hour response

Common issues:
- "Invalid API key" → Check format at ai.google.dev
- "License activation failed" → Check email/internet
- "AI not working" → Check Gemini quota

## Success Metrics

**Week 1**: 100 downloads, 5 sales ($395)
**Month 1**: 500 downloads, 50 sales ($3,950)
**Month 3**: 2,000 downloads, 200 sales ($15,800)

Refund rate target: <5%

## After First $10k

Reinvest in:
1. Code signing ($500) - build trust
2. Marketing budget ($2k) - sponsored posts
3. Hire developer ($3k) - features/bugs
4. Professional services ($1k) - legal/accounting
5. Keep rest ($3.5k) - you earned it!

## License Generation

Generate keys manually until 50 sales, then automate with Zapier/Make.com.

**Track in spreadsheet**:
- Date, Email, Tier, License Key, Payment ID, Status

## Legal Minimum

**Terms**: "Use at own risk. No warranty. No illegal use."
**Privacy**: "Data stored locally. We don't collect searches or API keys."
**Refund**: "30-day money-back guarantee"

## Emergency Contacts

- Payment issues: support@gumroad.com
- Technical issues: GitHub Issues
- Sales questions: [Your email]

---

**Remember**: Done is better than perfect. Ship it, learn, iterate.

First sale > Perfect product. Launch now! 🚀
