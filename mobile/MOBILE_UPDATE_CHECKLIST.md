# Mobile App Audit Report

## Audit Date: February 2, 2026

## Summary
The mobile app is **fairly feature-complete** but has some gaps compared to the web version. Most core functionality exists. Primary focus should be on testing/verification and a few missing features.

---

## FEATURE COMPARISON: Mobile vs Web

### Core Features - PRESENT IN MOBILE
| Feature | Status | Notes |
|---------|--------|-------|
| Chat with characters | ✅ Complete | Save, invite friend buttons work |
| Roundtable discussions | ✅ Complete | Save, invite, topic-based |
| Bible Reader | ✅ Complete | 9 translations, chat about verses |
| Bible Studies | ✅ Complete | Progress tracking, lesson completion |
| Reading Plans | ✅ Complete | Start, progress, complete days |
| My Walk | ✅ Complete | Chats, roundtables, studies tabs |
| Profile | ✅ Complete | Email, org, status, upgrade, delete |
| Premium/Paywall | ✅ Complete | In-app purchase integration |
| Invite to chat | ✅ Complete | Creates link, native share sheet |
| Save conversations | ✅ Complete | Toggle favorite |
| Deep linking | ✅ Complete | /join/:code works |

### Features - NEED VERIFICATION
| Feature | Web Status | Mobile Status | Action |
|---------|------------|---------------|--------|
| Share conversation link | ✅ Web | ❓ Untested | Test share generates public link |
| 90+ characters load | ✅ Web | ❓ Untested | Verify all characters appear |
| 35+ studies load | ✅ Web | ❓ Untested | Verify count matches web |
| 140+ plans load | ✅ Web | ❓ Untested | Verify count matches web |
| Category filters (plans) | ✅ Web (10 categories) | ❌ Missing | Plans screen shows no category filter |
| Featured/visibility filters | ✅ Web | ✅ Partial | Featured shown, but no visibility toggle |

### Features - MISSING FROM MOBILE
| Feature | Priority | Notes |
|---------|----------|-------|
| Reading Plan Categories | HIGH | Web has 10 categories, mobile shows flat list |
| Share conversation (public link) | MEDIUM | Invite exists, but not "share read-only link" |
| Netflix-style plan layout | LOW | Web has horizontal scroll by category |
| Insights panel in chat | LOW | Web shows character insights sidebar |
| Favorites page | LOW | My Walk has favorites, but no dedicated page |

---

## DETAILED SCREEN AUDIT

### 1. Home Screen (HomeScreen)
- ✅ Logo and tagline
- ✅ Start a Chat button
- ✅ Start a Roundtable button (premium gated)
- ✅ Browse Bible Studies button
- ✅ My Walk button
- ❌ Missing: Quick stats (90+ characters, etc.)
- ❌ Missing: Featured characters carousel

### 2. Chat (ChatNew → ChatDetail)
- ✅ Character selection
- ✅ Message sending/receiving
- ✅ Save conversation (toggle favorite)
- ✅ Invite friend (creates invite, native share)
- ✅ Study-specific buttons (Save to My Walk, Lesson Complete)
- ✅ Character avatar in header
- ❌ Missing: Share public read-only link
- ❌ Missing: Insights panel (character wisdom sidebar)

### 3. Bible Reader
- ✅ 9 translations available
- ✅ Book/chapter navigation
- ✅ Verse selection
- ✅ "Chat about this" feature
- ✅ Caching for offline use

### 4. Reading Plans (ReadingPlans → ReadingPlanDetail)
- ✅ List all plans
- ✅ Featured plans section
- ✅ Active plans section
- ✅ Start/continue plan
- ✅ Day-by-day progress
- ✅ Mark day complete
- ✅ Difficulty badges
- ❌ Missing: Category filters (10 categories on web)
- ❌ Missing: Netflix-style horizontal scroll by category

### 5. Studies (StudiesList → StudyDetail)
- ✅ List all studies
- ✅ Progress percentage display
- ✅ Lesson count
- ✅ Premium gating
- ✅ Organization filtering (owner_slug)
- ❌ Missing: Category filters
- ❌ Missing: Featured studies section

### 6. My Walk
- ✅ Three tabs: Chats, Roundtables, Studies
- ✅ Saved conversations list
- ✅ Favorite characters section
- ✅ Add favorite character modal
- ✅ Study progress with percentage
- ✅ Delete/rename study progress
- ❌ Missing: Reading plan progress section

### 7. Profile
- ✅ Email display
- ✅ Organization display
- ✅ Premium status
- ✅ Daily message counter (free users)
- ✅ Upgrade button
- ✅ Sign out
- ✅ Delete account

### 8. Roundtable (RoundtableSetup → RoundtableChat)
- ✅ Topic input
- ✅ Character selection (2-5)
- ✅ Multi-character responses
- ✅ Save roundtable
- ✅ Invite friend
- ✅ Resume existing roundtable
- ✅ Round tracking

---

## RECOMMENDATIONS

### Priority 1: Add Reading Plan Categories
The web has 10 categories with Netflix-style browsing. Mobile shows a flat list.
**File:** `mobile/src/screens/ReadingPlans.tsx`
**Effort:** Medium (2-3 hours)

### Priority 2: Add My Walk - Reading Plans Tab
My Walk shows Chats, Roundtables, Studies but not Reading Plans progress.
**File:** `mobile/src/screens/MyWalk.tsx`
**Effort:** Low (1-2 hours)

### Priority 3: Verify Content Counts
Test that mobile loads:
- All 90+ characters
- All 35+ studies
- All 140+ reading plans
- All 9 Bible translations

### Priority 4: Test Complete User Flows
1. Signup → Chat → Save → Share → Invite → Friend joins
2. Start study → Complete lessons → Track progress
3. Start reading plan → Complete days → Track progress
4. Bible reader → Select verses → Chat about them

---

## CURRENT APP STATUS

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
