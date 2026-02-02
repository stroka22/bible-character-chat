# Mobile App Update Checklist

## Current Mobile App Status (as of Feb 2026)
The mobile app has most features but needs verification that everything works like the desktop version.

---

## 1. SSL/CERTIFICATE FIX (URGENT)
**Issue:** "Server could not identify the security certificate" / "name mismatch"
**Action Required:** 
- Check SSL certificate configuration on hosting provider
- Ensure certificate covers both `faithtalkai.com` and `www.faithtalkai.com`
- Regenerate certificate if needed
- Set up proper www/non-www redirects

**Note:** This is a hosting configuration issue, not a code change.

---

## 2. EXISTING SCREENS - Updates Needed

### BibleReader.tsx
- [x] Exists in mobile
- [ ] Verify 9 translations are available (KJV, ASV, WEB, BBE, AKJV, DRB, YLT, Webster, Weymouth)
- [ ] Verify bookmark/save functionality
- [ ] Check navigation works properly

### ChatDetail.tsx / ChatNew.tsx
- [x] Exists in mobile
- [ ] Add "Save conversation" button
- [ ] Add "Share conversation" functionality  
- [ ] Add "Invite friend" to join conversation
- [ ] Verify insights panel works
- [ ] Add character insights/wisdom display
- [ ] Ensure message refresh persistence fix is applied

### RoundtableChat.tsx / RoundtableSetup.tsx
- [x] Exists in mobile
- [ ] Verify character selection works (2-5 characters)
- [ ] Add save/share functionality
- [ ] Check topic input and discussion flow

### StudiesList.tsx / StudyDetail.tsx
- [x] Exists in mobile
- [ ] Verify 35+ studies are loading
- [ ] Check category filtering
- [ ] Verify lesson progress tracking
- [ ] Add featured studies section

### ReadingPlans.tsx / ReadingPlanDetail.tsx
- [x] Exists in mobile
- [ ] Verify 140+ plans are loading
- [ ] Check 10 category filters work
- [ ] Verify progress tracking
- [ ] Add featured plans section
- [ ] Check Netflix-style horizontal scrolling

### MyWalk.tsx
- [x] Exists in mobile
- [ ] Verify progress tracking displays correctly
- [ ] Check Bible reading progress
- [ ] Verify study progress
- [ ] Check reading plan progress

### Profile.tsx
- [x] Exists in mobile
- [ ] Verify settings work
- [ ] Check account info displays

### Paywall.tsx
- [x] Exists in mobile
- [ ] Verify pricing: $6.99/month, $49.99/year
- [ ] Check in-app purchases work (iOS/Android)
- [ ] Verify premium features gate properly

---

## 3. FEATURE PARITY VERIFICATION

### A. Save/Share/Invite System
**Exists - needs testing:**
- [ ] Save conversation works and persists
- [ ] Share generates correct link
- [ ] Share link opens correctly on recipient's device
- [ ] Invite sends notification/link
- [ ] Join via invite link works
- [ ] Deep links handled: `/join/:code`, `/invite/:code`, `/shared/:code`

### B. My Walk Page
**Exists - verify matches desktop:**
- [ ] Shows Bible reading progress
- [ ] Shows study completion progress
- [ ] Shows reading plan progress
- [ ] Progress syncs between mobile and desktop
- [ ] All stats display correctly

### C. Conversation History
**Verify functionality:**
- [ ] `ChatList.tsx` shows all saved conversations
- [ ] Can resume previous conversations
- [ ] Delete conversation works
- [ ] Conversations sync with desktop

### D. Settings/Profile
**Verify functionality:**
- [ ] Account info displays correctly
- [ ] Can change settings
- [ ] Premium status shows correctly
- [ ] Logout works

---

## 4. UI/UX UPDATES

### Navigation
- [ ] Verify bottom tab navigation includes all sections
- [ ] Add proper deep linking for shared URLs
- [ ] Handle `/invite/:code` and `/join/:code` routes

### Styling
- [ ] Match scroll theme from web (amber/parchment)
- [ ] Consistent typography with web
- [ ] Proper dark mode support (if applicable)

### Performance
- [ ] Lazy loading for character lists
- [ ] Image optimization
- [ ] Caching for offline reading plans/studies

---

## 5. BACKEND/API VERIFICATION

### Endpoints to verify mobile can access:
- [ ] `/api/characters` - All 90+ characters
- [ ] `/api/studies` - All 35+ studies with categories
- [ ] `/api/reading-plans` - All 140+ plans with categories
- [ ] `/api/conversations` - Save/load conversations
- [ ] `/api/invites` - Create/accept invites
- [ ] `/api/bible` - All 9 translations
- [ ] `/api/progress` - User progress tracking

---

## 6. APP STORE REQUIREMENTS

### Before Submitting Update:
- [ ] Update version number
- [ ] Update screenshots showing new features
- [ ] Update app description mentioning:
  - 90+ Biblical Characters
  - 35+ Character-Led Bible Studies  
  - 140+ Reading Plans
  - 9 Bible Translations
  - Save, Share & Invite features
  - Roundtable Discussions
- [ ] Test on multiple devices/OS versions
- [ ] Verify in-app purchases still work
- [ ] Check for any deprecated APIs

---

## 7. PRIORITY ORDER

### Phase 1 (Critical)
1. Fix SSL certificate issue (Vercel dashboard)
2. Test full user flow: signup → chat → save → share → invite
3. Verify Bible Reader with all 9 translations
4. Verify My Walk shows all progress correctly

### Phase 2 (Important)  
5. Test all 90+ characters load and respond
6. Test all 35+ studies and progress tracking
7. Test all 140+ reading plans and categories
8. Verify premium gating works correctly

### Phase 3 (Polish)
9. Compare UI side-by-side with desktop
10. Fix any visual inconsistencies
11. Test offline behavior
12. Update app store screenshots/description

---

## 8. TESTING CHECKLIST

Before release:
- [ ] Test signup/login flow
- [ ] Test premium purchase flow
- [ ] Test chat with multiple characters
- [ ] Test roundtable setup and discussion
- [ ] Test Bible reader navigation
- [ ] Test study progress tracking
- [ ] Test reading plan progress
- [ ] Test share functionality
- [ ] Test invite/join flow
- [ ] Test on iOS (multiple versions)
- [ ] Test on Android (multiple versions)
- [ ] Test offline behavior
- [ ] Test push notifications (if applicable)

---

## Notes

**Haven Competitor:**
Joshua Wright uses Haven in his videos. Haven appears to be a simpler AI faith tool. Our differentiators:
- 90+ characters (vs likely fewer)
- Roundtable discussions (unique feature)
- 35+ structured Bible studies
- 140+ reading plans
- 9 Bible translations
- Save/Share/Invite social features
- Character-led learning (not just Q&A)

**Make sure mobile showcases these differentiators prominently.**
