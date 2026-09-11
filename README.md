# Volunteer Recruitment App - Cloudflare Worker + D1 + GitHub

## Setup Steps (GitHub Connect)

1. GitHub এ নতুন Repo বানাও: prasenjit-volunteer-app
2. এই ফোল্ডারের সব ফাইল push করো
3. Cloudflare Dashboard > D1 > Create Database -> ID copy করে wrangler.toml এ বসাও
4. D1 > Console এ গিয়ে schema.sql এর কোড run করো
5. GitHub Repo Settings > Secrets:
   - CF_API_TOKEN = তোমার Cloudflare Token
   - CF_ACCOUNT_ID = Account ID
6. wrangler.toml এ ADMIN_TOKEN বদলে দাও (যেমন admin123 -> তোমার পাসওয়ার্ড)
7. Push করলেই Auto Deploy হবে

Local Test:
npm install
npx wrangler dev

Routes:
- / -> Form
- /download.html?id=PS-VOL-... -> Slip Download
- /admin.html -> Admin Panel
