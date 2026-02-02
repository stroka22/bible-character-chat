# Mobile App Update Checklist

## Current Mobile App Status (as of Jan 2026)
The mobile app is significantly behind the web version. Here's what needs to be added/updated:

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

## 3. NEW FEATURES TO ADD

### A. Save/Share/Invite System (HIGH PRIORITY)
**Files needed:**
- Update `ChatDetail.tsx` - Add save, share, invite buttons
- Update `RoundtableChat.tsx` - Add save, share functionality
- Create share modal/sheet component
- Create invite link generation
- Handle deep links for `/join/:code`

### B. Favorites/Bookmarks Screen
**Currently missing from mobile**
- Create `Favorites.tsx` screen
- Show saved conversations
- Show bookmarked verses
- Show saved studies

### C. Conversation History
**Partially exists but needs updates**
- `ChatList.tsx` - Verify shows saved conversations
- Add filtering/search
- Add delete functionality

### D. Settings Screen
**May need creation/updates**
- Theme preferences
- Notification settings
- Account management
- Translation preferences

### E. How It Works / Onboarding
**Could add for new users**
- Onboarding flow screens
- Feature highlights
- Tutorial tips

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
1. Fix SSL certificate issue
2. Verify Bible Reader with all 9 translations
3. Add Save/Share/Invite to chat
4. Update study and plan counts

### Phase 2 (Important)
5. Add Favorites screen
6. Update navigation
7. Verify progress tracking
8. Polish UI to match web

### Phase 3 (Nice to Have)
9. Onboarding flow
10. Offline support
11. Push notifications
12. Widget support

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
