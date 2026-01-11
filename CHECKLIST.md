# Parallax Development Checklist

Quick reference for tracking completion status. See [`INCOMPLETE_FEATURES_AUDIT.md`](./INCOMPLETE_FEATURES_AUDIT.md) for details.

---

## 🔴 P0 - CRITICAL (Required for v1.0)

### Quick Wins (2 hours)
- [ ] Replace all placeholder URLs (`yourusername`, `example.com`, etc.)
- [ ] Configure Sentry integration (create project, add DSN)

### Legal Compliance (1-2 days) ⚖️
- [ ] Draft Terms of Service
- [ ] Create Acceptable Use Policy
- [ ] Write Responsible Disclosure policy
- [ ] Implement ToS acceptance in FirstRun wizard
- [ ] Store ToS acceptance in vault database
- [ ] Add legal warnings to high-risk dork templates

### License Server (3-5 days) 🔐
- [ ] Choose licensing solution (Gumroad/LemonSqueezy vs custom)
- [ ] Generate Ed25519 keypair securely
- [ ] Replace `LICENSE_PUBLIC_KEY` placeholder (`src-tauri/src/licensing.rs:7`)
- [ ] Implement `verify_license_signature()` (`src-tauri/src/licensing.rs:228`)
- [ ] Replace `SECRET_KEY` in `scripts/generate-license.py:22`
- [ ] Test license activation/deactivation flow
- [ ] Create license server API (if custom solution)
- [ ] Implement Gumroad webhook integration (if using Gumroad)

### Export Functionality (2-3 days) 📤
- [ ] Implement CSV export (`src-tauri/src/commands.rs:143`)
  - [ ] Add `csv` crate to Cargo.toml
  - [ ] Handle field escaping and quoting
  - [ ] Test with complex data
- [ ] Implement PDF export (`src-tauri/src/commands.rs:147`)
  - [ ] Add `printpdf` crate to Cargo.toml
  - [ ] Design PDF layout with branding
  - [ ] Implement pagination for large datasets
  - [ ] Test with various data sizes

---

## 🟠 P1 - HIGH PRIORITY (Required for feature completeness)

### Update Checker (1-2 days) 🔄
- [ ] Add `tauri-plugin-updater` to dependencies
- [ ] Implement version checking (`src-tauri/src/commands.rs:175`)
- [ ] Configure GitHub releases as update source
- [ ] Create update notification UI
- [ ] Add update progress indicator
- [ ] Implement restart prompt after update
- [ ] Test update flow on all platforms

### CI/CD Pipeline (2-3 days) 🤖
- [ ] Create `build.yml` workflow (PR validation)
  - [ ] Run ESLint + Clippy
  - [ ] Execute tests
  - [ ] Build release artifacts
- [ ] Create `test.yml` workflow
  - [ ] Run all tests with coverage
  - [ ] Upload coverage to Codecov
- [ ] Configure code signing
  - [ ] Windows Authenticode certificate
  - [ ] macOS Developer certificate + notarization
- [ ] Add Dependabot configuration

### Test Suite (1-2 weeks) 🧪
- [ ] Frontend tests (Vitest + React Testing Library)
  - [ ] Install test dependencies
  - [ ] Create test utilities and mocks
  - [ ] Test critical components (DorkBuilder, Library, Settings)
  - [ ] Test pages (Dashboard, Builder, Library)
  - [ ] Achieve 50%+ coverage
- [ ] Backend tests (Rust)
  - [ ] Test vault operations
  - [ ] Test license validation
  - [ ] Test security service
  - [ ] Test command handlers
  - [ ] Achieve 60%+ coverage
- [ ] E2E tests (Playwright)
  - [ ] First-run experience
  - [ ] License activation flow
  - [ ] Dork builder → execution → export
  - [ ] Settings configuration

### Feature Pages (2-3 weeks) 🎨

#### NexusGraph (5-7 days)
- [ ] Choose graph library (React Flow, Cytoscape, or D3)
- [ ] Design node/edge data structure
- [ ] Implement graph layout algorithms
- [ ] Add interactive controls (zoom, pan, filter)
- [ ] Implement node clustering
- [ ] Add export functionality (PNG, SVG, JSON)
- [ ] Create sample datasets

#### Terminal (5-7 days)
- [ ] Integrate xterm.js
- [ ] Create command parser
- [ ] Implement built-in commands
  - [ ] `search <query>`
  - [ ] `save <name>`
  - [ ] `list`
  - [ ] `export <format>`
  - [ ] `help`
  - [ ] `clear`
- [ ] Add command history (up/down arrows)
- [ ] Implement tab completion
- [ ] Add syntax highlighting

#### ImageIntel (7-10 days)
- [ ] File upload interface (drag & drop)
- [ ] EXIF data extraction (`exifr` library)
- [ ] Geolocation mapping (React Leaflet)
- [ ] Reverse image search integration
  - [ ] Google Images
  - [ ] TinEye
  - [ ] Bing Visual Search
- [ ] OCR text extraction (Tesseract.js)
- [ ] Image metadata tampering detection
- [ ] Batch processing support

#### VoiceCommands (3-5 days)
- [ ] Integrate Web Speech API
- [ ] Design voice command grammar
- [ ] Implement command recognition
  - [ ] "Search for [query]"
  - [ ] "Save dork as [name]"
  - [ ] "Export results as [format]"
  - [ ] "Show my saved dorks"
  - [ ] "Clear results"
- [ ] Add visual feedback for listening state
- [ ] Test across browsers

---

## 🟡 P2 - MEDIUM PRIORITY (Quality & polish)

### Rate Limiting (1 day) 🚦
- [ ] Implement Gemini API rate limiting (use `governor` crate)
- [ ] Add per-tier limits (Free: 10/day, Pro: 1000/day, etc.)
- [ ] Add visual feedback for rate limits
- [ ] Show remaining quota in UI
- [ ] Implement export rate limiting
- [ ] Add search execution limits

### Accessibility (3-5 days) ♿
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Add focus indicators
- [ ] Test with screen readers (NVDA, VoiceOver)
- [ ] Ensure WCAG 2.1 AA contrast ratios
- [ ] Support zoom up to 200%
- [ ] Add skip-to-content links

### Internationalization (2-3 days) 🌍
- [ ] Install `react-i18next`
- [ ] Extract all UI strings to translation files
- [ ] Create namespace structure
- [ ] Implement language selector in Settings
- [ ] Add language persistence
- [ ] Support initial languages (en, es, fr)

### Documentation (3-5 days) 📚
- [ ] Create architecture diagrams
- [ ] Document system design
- [ ] Write deployment guide
- [ ] Complete troubleshooting guide
- [ ] Add FAQ section
- [ ] Document development workflow
- [ ] Create code style guidelines

### Contribution Guidelines (1 day) 🤝
- [ ] Write CONTRIBUTING.md
- [ ] Adopt CODE_OF_CONDUCT.md
- [ ] Create PULL_REQUEST_TEMPLATE.md
- [ ] Create issue templates
  - [ ] Bug report
  - [ ] Feature request
  - [ ] Security vulnerability
- [ ] Document branching strategy
- [ ] Define commit message conventions

### Performance Optimization (2-3 days) ⚡
- [ ] Implement route lazy loading
- [ ] Add code splitting
- [ ] Analyze and optimize bundle size
- [ ] Implement virtual scrolling (react-window)
- [ ] Memoize expensive components
- [ ] Debounce search inputs
- [ ] Add Web Vitals tracking
- [ ] Configure Lighthouse CI

---

## 🟢 P3 - LOW PRIORITY (Enhancements)

### Dashboard Enhancements (2-3 days)
- [ ] Add usage analytics charts (Chart.js/Recharts)
- [ ] Create recent activity timeline
- [ ] Add quick action buttons
- [ ] Show search history widget
- [ ] Display performance metrics
- [ ] Add license status widget
- [ ] Show system health indicators

### Settings Page (2 days)
- [ ] Add advanced configuration panel
- [ ] Implement data export/import
- [ ] Add cache management
- [ ] Show API quota monitoring
- [ ] Add theme customization
- [ ] Configure keyboard shortcuts
- [ ] Add about/diagnostics section

### Dork Templates Refinement (1 day)
- [ ] Replace all `example.com` placeholders
- [ ] Add legal warnings to high-risk templates
- [ ] Add `requiresAuthorization` flags
- [ ] Implement template validation
- [ ] Add more template categories
- [ ] Create template contribution guide

### Dark Mode Consistency (1 day)
- [ ] Audit all components for dark mode support
- [ ] Add theme toggle to header
- [ ] Test contrast ratios in dark mode
- [ ] Implement theme persistence
- [ ] Add system theme detection

### First-Run Experience (2 days)
- [ ] Add ToS/EULA acceptance screen (Move to P0!)
- [ ] Create interactive tutorial
- [ ] Add feature showcase carousel
- [ ] Create sample dork demo
- [ ] Add progressive onboarding tips

### Loading States (1 day)
- [ ] Create standard Loading component
- [ ] Add skeleton loaders for list views
- [ ] Implement progressive loading
- [ ] Add loading states to all async operations
- [ ] Create loading style guide

### Error Handling (2 days)
- [ ] Create standard error handling utility
- [ ] Implement error boundary components
- [ ] Standardize error messages
- [ ] Add error context (where, why, how to fix)
- [ ] Add retry mechanisms

### Audit Logging (3-5 days) 📝
- [ ] Create audit_logs table in vault database
- [ ] Implement tamper-proof logging
- [ ] Track security-relevant events
- [ ] Create audit log viewer UI
- [ ] Add filtering and search
- [ ] Implement log export (CSV/PDF)
- [ ] Add log retention policies

### Build Scripts (1 day)
- [ ] Create `build-all-platforms.sh`
- [ ] Create `pre-build-checks.sh`
- [ ] Create `post-build-tests.sh`
- [ ] Create `sign-builds.sh`
- [ ] Create `create-release.sh`

### Security Headers (4 hours)
- [ ] Tighten CSP policies
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Add Referrer-Policy
- [ ] Implement Subresource Integrity
- [ ] Add security audit CI checks

### Configuration Management (1 day)
- [ ] Create comprehensive `.env.example`
- [ ] Document all environment variables
- [ ] Add configuration validation on startup
- [ ] Create advanced settings panel in UI
- [ ] Implement config export/import

---

## 📊 PROGRESS TRACKER

**Last Updated**: 2026-01-11

| Priority | Total | Complete | %   |
|----------|-------|----------|-----|
| P0       | 4     | 0        | 0%  |
| P1       | 4     | 2*       | 40% |
| P2       | 7     | 0        | 0%  |
| P3       | 11    | 0        | 0%  |
| **Total**| **26**| **2**    | **8%** |

*Conversation persistence + Release workflow (already complete)

---

## 🎯 MILESTONES

### v1.0.0 - Production Launch
**Target**: 3 weeks from start
**Blockers**: All P0 items

✅ Checklist:
- [ ] All P0 items complete
- [ ] Manual testing on Windows/macOS/Linux
- [ ] ToS acceptance required
- [ ] License server working
- [ ] CSV/PDF export functional
- [ ] No placeholder URLs
- [ ] Sentry active
- [ ] Release notes written

### v1.5.0 - Feature Complete
**Target**: 2-3 months after v1.0
**Focus**: All 4 feature pages

✅ Checklist:
- [ ] NexusGraph implemented
- [ ] Terminal implemented
- [ ] ImageIntel implemented
- [ ] VoiceCommands implemented
- [ ] Test coverage >70%
- [ ] All P1 items complete

### v2.0.0 - Enterprise Ready
**Target**: 4-6 months after v1.0
**Focus**: Polish & enterprise features

✅ Checklist:
- [ ] Audit logging system
- [ ] Accessibility WCAG 2.1 AA
- [ ] i18n support (3+ languages)
- [ ] Comprehensive documentation
- [ ] All P2 items complete
- [ ] Performance optimized

---

## 🚀 QUICK START

**Starting today?** Follow this order:

1. **Hour 1**: Quick wins (URLs, Sentry)
2. **Day 1-2**: Legal documents + ToS implementation
3. **Day 3-5**: License server implementation
4. **Day 6-7**: CSV/PDF export
5. **Week 2**: Update checker + CI/CD
6. **Week 3**: Testing + launch prep

Then proceed to P1 items (feature pages).

---

## 📝 NOTES

- Check off items as you complete them
- Update progress tracker weekly
- Create GitHub issues for P0/P1 items
- Celebrate small wins! 🎉

---

**For detailed information, see**:
- [`INCOMPLETE_FEATURES_AUDIT.md`](./INCOMPLETE_FEATURES_AUDIT.md) - Full audit report
- [`PRIORITY_ACTION_PLAN.md`](./PRIORITY_ACTION_PLAN.md) - Week-by-week roadmap
