# 📦 Deployment Guide — Bible Character Chat

A step-by-step handbook for putting the **Bible Character Chat** platform into production.  
Covers hosting choices, database provisioning, environment variables, CI/CD, domain + SSL, plus hardening tips.

---

## 1. Prerequisites

| Requirement | Why you need it |
|-------------|-----------------|
| **Git & GitHub** | Source-control + CI integration |
| **Node ≥ 20 & npm ≥ 10** | Building the React + Vite front-end |
| **Supabase account** | PostgreSQL DB, Auth & Storage |
| **OpenAI account** | GPT-4 API key |
| A domain name | e.g. `askjesus.ai` |
| Optional Stripe account | If you plan to charge users |

---

## 2. Repository Setup

1. Initialise Git inside the project folder  
   `git init && git add . && git commit -m "Initial commit"`
2. Create a **private** GitHub repo, then:  
   `git remote add origin https://github.com/<org>/bible-character-chat.git`  
   `git push -u origin main`
3. Add the default `.gitignore` (already in the project) – confirm `node_modules`, `dist`, `.env*` are ignored.

---

## 3. Supabase Configuration

### 3.1  Create a project
- In the Supabase dashboard click **New Project** → choose region → set strong DB password.

### 3.2  Apply SQL schema
```bash
supabase login
supabase link --project-ref <PROJECT_ID>
supabase db push        # applies migrations/supabase/migrations/*
```

### 3.3  Storage Buckets (optional)
Create `avatars` bucket for custom character images (public).

### 3.4  Secrets & Policies
- In **Project Settings → API** copy:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- RLS is already enabled in the provided schema.

---

## 4. Environment Variables

Create two files:

### `.env.local` (frontend / Vite)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=pk_xxxxxxxxxx
***REMOVED***
```

### Production secrets  
Store **server–side** keys (OpenAI, Stripe) in:

* **Vercel / Netlify** → Project → Settings → Environment Variables  
* **Docker** → `docker-compose.yml` → `environment:`  
* **DigitalOcean / AWS** → Secret Manager / Parameter Store  

Never expose the real `OPENAI_API_KEY` to the browser in production.  
Use a Supabase Edge Function or tiny Node/Cloudflare worker to proxy chat requests.

---

## 5. Hosting Options

| Option | Notes | CLI |
|--------|-------|-----|
| **Vercel** | Easiest, auto-detects Vite. Free SSL. | `vercel` |
| **Netlify** | Similar simplicity, functions built-in. | `ntl deploy` |
| **Cloudflare Pages + Functions** | Good for global latency. | `wrangler pages deploy dist` |
| **DigitalOcean Droplet + Docker** | Full control, SSH access. | `docker compose up -d` |
| **AWS Amplify / ECS** | Enterprise scale. | – |

### Build settings (Vercel / Netlify)
```
Framework: Other (Vite)
Build command: npm run build
Output directory: dist
```

---

## 6. Continuous Deployment (GitHub Actions)

`.github/workflows/deploy.yml` (example for Vercel):

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./
```

Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as repo secrets.

---

## 7. Domain & SSL

1. **Add domain** in hosting provider (e.g. Vercel → Domains → Add).
2. Update your DNS registrar with the provided A/CNAME records.
3. Wait for propagation; provider issues Let’s Encrypt cert automatically.
4. Force HTTPS:
   - Vercel: *Settings → Domains → Enforce HTTPS*.
   - Netlify: *Domain management → HTTPS → Enforce*.

---

## 8. Supabase Edge Function (secure OpenAI key)

```bash
supabase functions new chat-proxy
# functions/chat-proxy/index.ts
import OpenAI from "openai";
import { serve } from "std/server";

serve(async (req) => {
  const { messages, character } = await req.json();
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: character.persona_prompt },
      ...messages
    ],
    stream: true,
  });
  return new Response(completion.stream);
});
```

Deploy and set secret:  
`supabase secrets set ***REMOVED***
In the frontend call `/functions/v1/chat-proxy` instead of OpenAI directly.

---

## 9. Scaling & Monitoring

| Concern | Tool |
|---------|------|
| Error tracking | Sentry / LogRocket |
| Performance | Vercel Analytics / Lighthouse CI |
| DB load | Supabase Observability |
| Cron & jobs | Supabase Scheduled Functions |
| Backups | Supabase daily snapshots (enable in **Database Backups**) |

---

## 10. Security Hardening Checklist

- [ ] Use HTTPS everywhere (`Strict-Transport-Security` header).
- [ ] Set CSP, X-Frame-Options via hosting provider.
- [ ] Rotate OpenAI & Supabase keys periodically.
- [ ] Enable 2FA on GitHub and hosting dashboards.
- [ ] Review Supabase RLS policies before launch.

---

## 11. Go-Live Smoke Test

1. `curl -I https://yourdomain.com` → returns **200** + `Content-Type: text/html`.
2. Load homepage → upgrade button links to `/pricing.html`.
3. Supabase auth → sign-up/login works.
4. Character chat → GPT-4 responses within 10 s.
5. Pricing → Stripe test checkout succeeds.
6. Admin panel → can edit character prompt, change persists.
7. Mobile device → responsive layout OK.

---

## 12. Future Upgrades

- **Docker + Traefik** for multi-service orchestration
- **Redis** for rate-limiting / caching chat history
- **Cloudflare Stream** if you add video avatars
- **Kubernetes** if traffic exceeds 50k DAU

---

### 🎉 You’re Ready to Deploy!

Push `main → production` and watch the Gospel-powered conversations begin.  
Questions? Open an issue in GitHub or ping the dev channel.  
Blessings on your launch! 🚀🙏
