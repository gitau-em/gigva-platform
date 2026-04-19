# Gigva Kenya — Production Launch Guide

## Is the site launch-ready?

**Yes, with the checklist below completed.** The codebase is production-quality:
all forms submit to a real database, all admin routes are JWT-protected, emails
fire via real SMTP, security headers are set, and there are no rendering bugs.

The four things you must complete before going live are marked **REQUIRED**.
Everything else is recommended but can follow after launch.

---

## Pre-launch checklist

### REQUIRED — must be done before launch

- [ ] **Domain + DNS** configured (see Section 2)
- [ ] **`.env.local` / environment variables** set with real secrets (see Section 3)
- [ ] **Email SMTP** working — run the SMTP test in the admin panel after deploy
- [ ] **Staff passwords changed** — all staff log in at `/admin` and change from `blue1ocean`

### Recommended — do within the first week

- [ ] Google Search Console → submit sitemap at `https://gigvakenya.co.ke/sitemap.xml`
- [ ] Test every form end-to-end: contact, demo booking, free trial
- [ ] Confirm notification emails arrive at `ceo@gigva.co.ke` and `samuel.otieno@gigva.co.ke`
- [ ] Backup the SQLite database file (`data/gigva.sqlite`) to cloud storage

---

## Section 1 — Choosing a hosting platform

> **Vercel will NOT work** for this site. The app uses `better-sqlite3` (native
> binary) and writes to a local file — both are incompatible with Vercel's
> read-only serverless environment.

### Recommended: Railway (easiest, ~$5–10/month)

Railway gives you a persistent Linux container with a writable filesystem,
which is exactly what SQLite needs. It deploys from GitHub in minutes.

**Other options:**

| Platform | Difficulty | Cost | Notes |
|----------|-----------|------|-------|
| **Railway** | Easy | ~$5/mo | Best for this stack. Deploy from GitHub. |
| **Render** | Easy | Free tier available | Similar to Railway. May cold-start on free tier. |
| **DigitalOcean App Platform** | Easy | ~$12/mo | Good Nairobi latency options. |
| **VPS (DigitalOcean Droplet / Hetzner)** | Medium | ~$6/mo | Full control, you manage the server. |

---

## Section 2 — Domain setup (gigvakenya.co.ke)

### Step 1: Get your domain

If you don't already own `gigvakenya.co.ke`, register it at:
- **KENIC** (Kenya Network Information Centre) — official .co.ke registrar
- **Truehost Kenya** — local registrar, cheap, good support
- **Namecheap** — supports .co.ke, good UI

### Step 2: Point DNS to your server

Once deployed, you'll get a server IP address (VPS) or a deployment URL
(Railway/Render gives you something like `gigva-xyz.railway.app`).

**For Railway/Render (CNAME):**
```
Type:  CNAME
Name:  @  (or gigvakenya.co.ke)
Value: gigva-xyz.railway.app   ← your deployment URL
TTL:   3600
```

**For a VPS (A record):**
```
Type:  A
Name:  @
Value: 123.456.789.0   ← your server's IP address
TTL:   3600

Type:  A
Name:  www
Value: 123.456.789.0
TTL:   3600
```

### Step 3: SSL certificate

- **Railway / Render / DigitalOcean App Platform**: SSL is automatic. Done.
- **VPS**: Install Certbot → `sudo certbot --nginx -d gigvakenya.co.ke`

DNS changes take 1–48 hours to propagate globally. .co.ke domains typically
propagate in under 4 hours.

---

## Section 3 — Environment variables

Create a file called `.env.local` (or set these as environment variables in
your hosting dashboard). **Never commit this file to Git.**

```bash
# ── Security ──────────────────────────────────────────────────────────────────
# Generate a real secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_character_random_hex_string_here

# ── Superadmin account ────────────────────────────────────────────────────────
ADMIN_EMAIL=infoeddie1@gmail.com
ADMIN_PASSWORD=@G19631993

# ── Database ──────────────────────────────────────────────────────────────────
# On Railway/Render: use /app/data/gigva.sqlite or /data/gigva.sqlite
# On VPS: use an absolute path like /home/gigva/data/gigva.sqlite
DB_PATH=/app/data/gigva.sqlite

# ── Site ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://gigvakenya.co.ke
NODE_ENV=production

# ── Webmail (shown to staff as "My Inbox" button) ────────────────────────────
NEXT_PUBLIC_WEBMAIL_URL=https://mail.google.com

# ── Email (Google Workspace SMTP) ────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@gigva.co.ke
SMTP_PASS=your_16_char_google_app_password
SMTP_FROM="Gigva Kenya" <noreply@gigva.co.ke>
```

> **JWT_SECRET**: Must be a real random 64-byte hex string. The app will refuse
> to start in production if this is not set. Generate it with:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Section 4 — Deploy on Railway (step-by-step)

Railway is the recommended platform for this stack.

### 4.1 Push to GitHub

```bash
cd gigva-final
git init
git add .
git commit -m "Initial production deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gigva-kenya.git
git push -u origin main
```

### 4.2 Create Railway project

1. Go to [railway.app](https://railway.app) → sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select your repo
3. Railway auto-detects Next.js and builds it

### 4.3 Set environment variables

In your Railway project → **Variables** tab → add every variable from
Section 3. Do not upload `.env.local`; paste each key-value into the dashboard.

### 4.4 Set the start command

In Railway project settings → **Deploy** section:
```
Build command:  npm run build
Start command:  npm start
```

### 4.5 Initialise the database

After the first deploy, open the Railway **Shell** tab and run:
```bash
npm run db:init
```

This creates the SQLite database and seeds all staff accounts. You only need
to run this once.

### 4.6 Add your custom domain

In Railway → your service → **Settings** → **Custom Domain**:
- Enter `gigvakenya.co.ke`
- Copy the CNAME value Railway gives you
- Add it as a CNAME record at your domain registrar (see Section 2)

Railway provisions your SSL certificate automatically within minutes.

### 4.7 Set DB_PATH to a persistent volume

Railway services have ephemeral filesystems — a redeploy can wipe `/app/data/`.
To make the database persistent:

1. In Railway → your project → **+ New** → **Volume**
2. Mount it at `/data`
3. Set `DB_PATH=/data/gigva.sqlite` in your environment variables
4. Re-run `npm run db:init` from the shell

---

## Section 5 — Deploy on a VPS (DigitalOcean / Hetzner)

If you prefer full control or want a Kenya-region server:

### 5.1 Create a server

- **DigitalOcean**: Create a Droplet → Ubuntu 24.04 → Basic plan ($6/mo)
- Choose the Nairobi region if available, or Johannesburg for lowest latency

### 5.2 Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5.3 Clone and build

```bash
git clone https://github.com/YOUR_USERNAME/gigva-kenya.git
cd gigva-kenya
npm install
cp .env.local.example .env.local
nano .env.local          # fill in all values
npm run db:init          # seed database
npm run build            # build production bundle
```

### 5.4 Run with PM2

```bash
sudo npm install -g pm2
pm2 start npm --name "gigva" -- start
pm2 startup              # auto-start on reboot
pm2 save
```

### 5.5 Set up Nginx as reverse proxy

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/gigvakenya
```

Paste:
```nginx
server {
    listen 80;
    server_name gigvakenya.co.ke www.gigvakenya.co.ke;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gigvakenya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d gigvakenya.co.ke -d www.gigvakenya.co.ke
```

---

## Section 6 — Email setup (Google Workspace)

Your SMTP sends from `noreply@gigva.co.ke`. Here's how to set it up:

1. **Buy Google Workspace** at [workspace.google.com](https://workspace.google.com)
   (~$6/user/month). You need one user for `noreply@gigva.co.ke`.
2. Verify your domain (Google gives you a TXT record to add to your DNS)
3. Create the email account `noreply@gigva.co.ke`
4. Enable 2-Step Verification on that account
5. Go to [myaccount.google.com](https://myaccount.google.com) → **Security** → **App passwords**
6. Generate a new app password → select "Mail" and "Other (Custom name)"
7. Copy the 16-character password → paste as `SMTP_PASS` in your environment

**Test it:** Log into the staff admin at `/admin`, go to **User Management** tab,
click **Test Connection**. It will show ✅ or a specific error.

**Also create these Google Workspace accounts** for the team:
`ceo@`, `cto@`, `samuel.otieno@`, `njeri.mwangi@`, `edward.gitau@`,
`daniel.njoroge@`, `james.odhiambo@`, `fatuma.kamau@` — all at `@gigva.co.ke`

---

## Section 7 — First login after launch

1. Go to `https://gigvakenya.co.ke/admin`
2. Log in with `infoeddie1@gmail.com` / `@G19631993`
3. Go to **User Management** → run the SMTP test
4. Ask each staff member to log in and change their password from `blue1ocean`
5. Submit a test contact form from the public site and confirm the notification email arrives

---

## Section 8 — Ongoing maintenance

| Task | Frequency | How |
|------|-----------|-----|
| Back up database | Daily | `cp /data/gigva.sqlite /backup/gigva-$(date +%Y%m%d).sqlite` |
| Review new demo requests | Daily | Log into `/admin` → Demo Bookings |
| Check failed emails | Weekly | Review server logs |
| Update Node.js | Monthly | `nvm install --lts` |
| Renew SSL (auto) | 90 days | Certbot/Railway handles this |

---

## What the site does NOT yet include (future work)

These are deliberate omissions for a pre-launch SaaS — not bugs:

- **No live Daraja M-Pesa webhook** — the dashboard preview uses sample data.
  Integrating the real Daraja API is post-launch work once you have a customer.
- **No payment processing** — subscription billing (M-Pesa/card) is not built.
  Manage early customers manually or via M-Pesa offline.
- **No customer data dashboard** — the `/dashboard` page shows onboarding status
  for trial users. The real reconciliation dashboard is the next build phase.

---

*Generated: April 2026 — Gigva Kenya Limited*
