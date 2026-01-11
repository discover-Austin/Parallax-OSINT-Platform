# Priority Action Plan

**Last Updated**: 2026-01-11
**Status**: Active Development

This document provides a prioritized, actionable roadmap for completing the Parallax Intelligence Platform. For detailed analysis, see [`INCOMPLETE_FEATURES_AUDIT.md`](./INCOMPLETE_FEATURES_AUDIT.md).

---

## 🔥 IMMEDIATE PRIORITIES (Start Today)

### Critical Path to v1.0 Launch

#### 1. ⚡ Quick Wins (Complete First - 2 hours total)
**Goal**: Clean up placeholders and improve professionalism

- [ ] **Replace Placeholder URLs** (1 hour)
  - Search and replace `yourusername` with actual GitHub username
  - Update `support@parallax.app` references
  - Fix `example.com` in dork templates
  - Update package.json metadata
  ```bash
  grep -r "yourusername" . --exclude-dir={node_modules,target,.git}
  grep -r "example\.com" src/data/dorkTemplates.ts
  ```

- [ ] **Configure Sentry** (1 hour)
  - Create Sentry project at sentry.io
  - Add `SENTRY_DSN` to environment variables
  - Test error reporting
  - Set up release tracking

#### 2. 🔐 Legal Compliance (MANDATORY - 1-2 days)
**Goal**: Ensure legal operation of the platform

- [ ] **Create Legal Documents** (Day 1)
  - Draft Terms of Service (use template from [Termly](https://termly.io))
  - Create Acceptable Use Policy (OSINT ethics focus)
  - Write Responsible Disclosure policy
  - Save in `docs/legal/`

- [ ] **Implement ToS Flow** (Day 2)
  - Add ToS acceptance checkbox to `src/pages/FirstRun.tsx`
  - Store acceptance in vault database
  - Add "Legal" section to Settings page
  - Block app usage until ToS accepted

#### 3. 💰 License Server (CRITICAL - 3-5 days)
**Goal**: Enable paid tier functionality

**Option A: Build Custom Server** (5 days)
- Day 1-2: Create REST API (Node.js/Python)
- Day 3: Implement Ed25519 signature verification
- Day 4: Add client-side verification
- Day 5: Testing and security audit

**Option B: Use Third-Party Service** (3 days - RECOMMENDED)
- Day 1: Integrate Gumroad/LemonSqueezy
- Day 2: Implement license verification
- Day 3: Testing and edge cases

**Recommendation**: Use Option B (third-party) to save 2 days and reduce security risk.

- [ ] Choose licensing service (Gumroad recommended)
- [ ] Set up license generation
- [ ] Replace `LICENSE_PUBLIC_KEY` placeholder
- [ ] Implement `verify_license_signature()` in `src-tauri/src/licensing.rs:228`
- [ ] Test activation/deactivation flow
- [ ] Generate actual secret key for `scripts/generate-license.py:22`

#### 4. 📤 Export Functionality (2-3 days)
**Goal**: Complete CSV and PDF export

- [ ] **CSV Export** (Day 1)
  ```toml
  # Add to src-tauri/Cargo.toml
  csv = "1.3"
  ```
  - Implement in `src-tauri/src/commands.rs:143`
  - Add proper field escaping
  - Test with complex data

- [ ] **PDF Export** (Day 2-3)
  ```toml
  # Add to src-tauri/Cargo.toml
  printpdf = "0.7"
  ```
  - Implement in `src-tauri/src/commands.rs:147`
  - Design PDF layout with branding
  - Add pagination for large datasets

---

## 📅 WEEK-BY-WEEK PLAN

### Week 1: Production Readiness
**Focus**: Critical blockers for launch

| Day | Tasks | Time |
|-----|-------|------|
| Mon | Quick wins (URLs, Sentry) + Legal document drafting | 6h |
| Tue | ToS implementation + Start license server | 6h |
| Wed | License server implementation | 8h |
| Thu | License server testing + CSV export | 8h |
| Fri | PDF export + Integration testing | 8h |

**Deliverable**: All P0 items complete

---

### Week 2: CI/CD & Updates
**Focus**: Automation and user experience

| Day | Tasks | Time |
|-----|-------|------|
| Mon | Update checker implementation (tauri-plugin-updater) | 6h |
| Tue | Update UI + GitHub release automation | 6h |
| Wed | CI/CD: Add build.yml workflow | 4h |
| Thu | CI/CD: Add test.yml workflow | 4h |
| Fri | Dependabot + PR/Issue templates | 4h |

**Deliverable**: Automated release pipeline

---

### Week 3: Testing & Launch Prep
**Focus**: Quality assurance

| Day | Tasks | Time |
|-----|-------|------|
| Mon | Frontend test setup (Vitest) | 6h |
| Tue | Critical path tests (license, export) | 6h |
| Wed | Backend tests (Rust unit tests) | 6h |
| Thu | Integration testing + bug fixes | 8h |
| Fri | Documentation updates + Release notes | 6h |

**Deliverable**: v1.0.0 Release Candidate

---

## 🎯 MILESTONE: v1.0.0 Launch Checklist

### Before Tagging v1.0.0

#### Code Quality
- [ ] All P0 items complete
- [ ] License server working in production
- [ ] CSV/PDF export functional
- [ ] ToS acceptance required
- [ ] All placeholder URLs replaced
- [ ] Sentry error tracking active
- [ ] Update checker working

#### Testing
- [ ] Manual testing on Windows
- [ ] Manual testing on macOS
- [ ] Manual testing on Linux
- [ ] License activation tested (all tiers)
- [ ] Export tested (all formats)
- [ ] Update flow tested

#### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md created
- [ ] Installation guide reviewed
- [ ] Legal documents in place
- [ ] Release notes written

#### Security
- [ ] No secrets in repository
- [ ] `.env.example` complete
- [ ] Code signing configured
- [ ] License verification secure

#### Release Process
- [ ] Version bumped in `Cargo.toml`
- [ ] Version bumped in `package.json`
- [ ] Git tag created (`v1.0.0`)
- [ ] GitHub release created
- [ ] Binaries uploaded for all platforms
- [ ] Release announcement ready

---

## 🚀 POST-LAUNCH: v1.1 - v2.0 Roadmap

### v1.1 - NexusGraph (2-3 weeks after v1.0)
**Focus**: Infrastructure visualization

- [ ] Choose graph library (React Flow recommended)
- [ ] Implement node/edge data structure
- [ ] Add interactive controls
- [ ] Create sample datasets

### v1.2 - Terminal Interface (2-3 weeks after v1.1)
**Focus**: CLI for power users

- [ ] Integrate xterm.js
- [ ] Implement command parser
- [ ] Add built-in commands
- [ ] Tab completion

### v1.3 - ImageIntel (3-4 weeks after v1.2)
**Focus**: IMINT analysis

- [ ] File upload interface
- [ ] EXIF extraction
- [ ] Reverse image search integration
- [ ] OCR implementation

### v1.4 - VoiceCommands (1-2 weeks after v1.3)
**Focus**: Voice control

- [ ] Web Speech API integration
- [ ] Voice command grammar
- [ ] Visual feedback
- [ ] Browser compatibility testing

### v2.0 - Enterprise Features (After v1.4)
**Focus**: Enterprise readiness

- [ ] Audit logging system
- [ ] Accessibility improvements
- [ ] i18n support
- [ ] Comprehensive documentation
- [ ] Performance optimization
- [ ] Advanced rate limiting

---

## 💡 DAILY WORKFLOW RECOMMENDATIONS

### Morning (First Hour)
1. Review GitHub issues/PRs
2. Check Sentry for new errors
3. Update project board
4. Plan daily tasks

### Development Time
1. Work on highest priority item from this plan
2. Commit frequently (conventional commits)
3. Write tests alongside features
4. Update documentation as you go

### End of Day
1. Push all commits
2. Update todo list in this document
3. Create PR if feature complete
4. Document blockers or questions

---

## 🔧 DEVELOPMENT ENVIRONMENT SETUP

### Required Tools
```bash
# Frontend
node -v  # v20+
npm -v   # v10+

# Backend
rustc --version  # 1.75+
cargo --version

# Tauri CLI
cargo install tauri-cli
```

### Environment Variables
```bash
# Create .env file
cp .env.example .env

# Required variables:
GEMINI_API_KEY=your_key_here        # For AI dork generation
SENTRY_DSN=your_dsn_here            # For error tracking
LICENSE_SECRET_KEY=generate_new_key # For license generation
```

### Pre-commit Hooks (Recommended)
```bash
# Install husky
npm install -D husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && cargo clippy"
```

---

## 📊 PROGRESS TRACKING

### Completion Status

| Category | Items | Complete | Progress |
|----------|-------|----------|----------|
| P0 - Critical | 4 | 0 | ░░░░░░░░░░ 0% |
| P1 - High | 4 | 2* | ████░░░░░░ 40% |
| P2 - Medium | 7 | 0 | ░░░░░░░░░░ 0% |
| P3 - Low | 11 | 0 | ░░░░░░░░░░ 0% |
| **TOTAL** | **26** | **2** | ██░░░░░░░░ 8% |

*Conversation persistence + Release workflow (corrected from audit)

### Weekly Check-in Questions
1. Are we on track for v1.0 launch?
2. What blockers exist?
3. Do we need to adjust priorities?
4. What quick wins can we tackle?

---

## 🤝 TEAM COLLABORATION (If Applicable)

### Task Assignment Strategy

**Solo Developer**:
- Focus on critical path (P0 → P1 → P2)
- Complete one category before moving to next
- Tackle quick wins during breaks

**Small Team (2-3 developers)**:
- Developer 1: License server + exports
- Developer 2: Legal docs + CI/CD
- Developer 3: Tests + documentation

**Larger Team (4+ developers)**:
- Backend team: License server, exports, rate limiting
- Frontend team: Feature pages, UI polish
- DevOps: CI/CD, deployment, monitoring
- QA: Test suite, manual testing

---

## 🐛 ISSUE TRACKING

### GitHub Issue Labels
Create these labels for organization:

- `priority: P0` - Critical blockers
- `priority: P1` - High priority
- `priority: P2` - Medium priority
- `priority: P3` - Low priority
- `type: bug` - Bug fixes
- `type: feature` - New features
- `type: docs` - Documentation
- `type: security` - Security issues
- `effort: small` - < 1 day
- `effort: medium` - 1-3 days
- `effort: large` - > 3 days
- `good first issue` - For contributors

### Creating Issues
Use this document to create GitHub issues for each incomplete item:

```bash
# Example issue creation for license server
gh issue create \
  --title "Implement license server signature verification" \
  --body "See INCOMPLETE_FEATURES_AUDIT.md #1" \
  --label "priority: P0,type: feature,effort: large"
```

---

## 📞 SUPPORT & RESOURCES

### Getting Help
- **Documentation**: See `docs/` directory
- **GitHub Issues**: Create issue with `question` label
- **Community**: GitHub Discussions (set up recommended)

### Useful Links
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ COMPLETED ITEMS LOG

Track completed items here for motivation and progress tracking:

### 2026-01-11
- [x] Comprehensive audit completed
- [x] Priority action plan created
- [x] Identified 2 incorrectly audited items (conversation persistence, release workflow)

---

**Next Action**: Start with "Quick Wins" section above! 🚀

**Remember**:
- Focus on one task at a time
- Test as you build
- Commit frequently
- Document decisions
- Ask for help when stuck

Good luck! 🎉
