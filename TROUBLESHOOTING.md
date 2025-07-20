# Troubleshooting “Something went wrong” Error

React’s ErrorBoundary shows this message when an uncaught runtime error bubbles up during render.  
Follow the steps below—top fixes solve 95 % of cases.

---

## 1&nbsp;·&nbsp;Reload & Clear Cache
1. **Hard-refresh** (Windows / Linux `Ctrl-Shift-R`, macOS `⌘-Shift-R`).  
2. Open DevTools → *Application* → *Service-Workers* → **Unregister** any workers.  
3. Still stuck? Clear site data (*Application* → *Storage* → **Clear site data**).

---

## 2&nbsp;·&nbsp;Check Environment Variables
The app needs real API keys.

| Variable | Purpose | Must be set |
|----------|---------|-------------|
| `VITE_OPENAI_API_KEY` | Chat responses | ✅ |
| `VITE_STRIPE_PUBLIC_KEY` | Payments | ✅ |
| `VITE_STRIPE_PRICE_MONTHLY` / `YEARLY` | Subscription plans | ✅ (if Stripe enabled) |

Update `.env`, then:
```bash
# rebuild & serve
npm run build
npx http-server dist -p 5179
```

---

## 3&nbsp;·&nbsp;Kill Port Conflicts
```bash
# find rogue processes
lsof -ti:5173,5174,5175,5179 | xargs kill -9
```
Restart the dev / preview server (`./start-react-app.sh --port 5179`).

---

## 4&nbsp;·&nbsp;Validate Service Files
`src/services/openai.js` and `src/services/stripe.js` must use **ESM exports only**:
```js
// GOOD
export { foo, bar };
```
Remove any `module.exports` blocks.

Re-build after edits.

---

## 5&nbsp;·&nbsp;Run Health Check Script
```bash
./check-app-health.sh
```
• Flags running servers  
• Detects bad export patterns  
• Warns about missing env vars

---

## 6&nbsp;·&nbsp;Bypass Mode (sanity test)
If problems persist, run a build that skips all APIs:

```bash
./run-bypass.sh          # static page on :5179
```
Page renders?  Then the core React tree is fine—return to Steps 2–4.

---

## 7&nbsp;·&nbsp;Inspect Console Errors
Open DevTools → **Console**. Note first red stack-trace line inside `src/…`.  
Common culprits: null `openai` / `stripe` objects, undefined props.

---

### Still Stuck?
1. Copy the first console error.
2. Run `./check-app-health.sh` and copy its summary.
3. Include both in a support request.

---  
**Tip:** keep a pristine `.env.example` in repo; never commit real keys.  
A missing or placeholder key is the #1 source of this error.
