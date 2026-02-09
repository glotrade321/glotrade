Running build in Washington, D.C., USA (East) – iad1 (Turbo Build Machine)
Build machine configuration: 30 cores, 60 GB
Cloning github.com/glotrade321/glotrade (Branch: main, Commit: 229176a)
Cloning completed: 547.000ms
Restored build cache from previous deployment (D6DMUkrLkEg5qXcSEuVZoUsRVXxF)
Running "vercel build"
Vercel CLI 50.13.2
> Detected Turbo. Adjusting default settings...
Running "install" command: `npm install --prefix=../..`...
up to date, audited 1202 packages in 6s
271 packages are looking for funding
  run `npm fund` for details
26 vulnerabilities (1 low, 1 moderate, 24 high)
To address all issues, run:
  npm audit fix
Run `npm audit` for details.
Detected Next.js version: 15.5.9
Running "cd ../.. && turbo run build --filter={apps/web}..."
Attention:
Turborepo now collects completely anonymous telemetry regarding usage.

This information is used to shape the Turborepo roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://turborepo.com/docs/telemetry
 WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
   x Could not resolve workspaces.
  `-> Lockfile not found at /vercel/path0/yarn.lock
• Packages in scope: web
• Running build in 1 packages
• Remote caching enabled
web:build: cache miss, executing f6ee1436f5c5f75b
web:build: yarn run v1.22.19
web:build: $ next build
web:build:    ▲ Next.js 15.5.9
web:build:    - Experiments (use with caution):
web:build:      · optimizePackageImports
web:build: 
web:build:    Creating an optimized production build ...
web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
web:build:  ✓ Compiled successfully in 17.0s
web:build:    Skipping linting
web:build:    Checking validity of types ...
web:build:    Collecting page data ...
web:build:    Generating static pages (0/69) ...
web:build:    Generating static pages (17/69) 
web:build:    Generating static pages (34/69) 
web:build:    Generating static pages (51/69) 
web:build:  ✓ Generating static pages (69/69)
web:build:    Finalizing page optimization ...
web:build:    Collecting build traces ...
web:build: 
web:build: Route (app)                                 Size  First Load JS
web:build: ┌ ƒ /                                    6.64 kB         254 kB
web:build: ├ ƒ /_not-found                            995 B         104 kB
web:build: ├ ƒ /admin                               11.6 kB         191 kB
web:build: ├ ƒ /admin/analytics                     7.03 kB         186 kB
web:build: ├ ƒ /admin/banners                          6 kB         115 kB
web:build: ├ ƒ /admin/coupons                       8.62 kB         256 kB
web:build: ├ ƒ /admin/credit-requests                7.7 kB         117 kB
web:build: ├ ƒ /admin/gdip                          6.93 kB         118 kB
web:build: ├ ƒ /admin/gdip/commodities              4.27 kB         116 kB
web:build: ├ ƒ /admin/gdip/cycles                   5.49 kB         115 kB
web:build: ├ ƒ /admin/gdip/cycles/create            4.69 kB         107 kB
web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         114 kB
web:build: ├ ƒ /admin/gdip/gdcs                     4.91 kB         114 kB
web:build: ├ ƒ /admin/gdip/partners                 4.55 kB         114 kB
web:build: ├ ƒ /admin/gdip/tpias                    4.38 kB         116 kB
web:build: ├ ƒ /admin/orders                         9.5 kB         2.4 MB
web:build: ├ ƒ /admin/product-managers              4.57 kB         114 kB
web:build: ├ ƒ /admin/product-managers/new           4.3 kB         114 kB
web:build: ├ ƒ /admin/products                      6.23 kB         116 kB
web:build: ├ ƒ /admin/products/[id]                 7.25 kB        2.54 MB
web:build: ├ ƒ /admin/products/new                  8.75 kB         260 kB
web:build: ├ ƒ /admin/reports                       14.7 kB         124 kB
web:build: ├ ƒ /admin/sales-agents                  6.04 kB         116 kB
web:build: ├ ƒ /admin/security                      6.54 kB         119 kB
web:build: ├ ƒ /admin/settings                        13 kB         125 kB
web:build: ├ ƒ /admin/store                         8.13 kB         255 kB
web:build: ├ ƒ /admin/users                           12 kB         122 kB
web:build: ├ ƒ /admin/wallets                       11.3 kB         121 kB
web:build: ├ ƒ /admin/withdrawals                   7.84 kB         255 kB
web:build: ├ ƒ /agent/commissions                   5.12 kB         245 kB
web:build: ├ ƒ /agent/dashboard                     5.19 kB         245 kB
web:build: ├ ƒ /agent/referrals                     4.88 kB         245 kB
web:build: ├ ƒ /auth/forgot                         4.92 kB         248 kB
web:build: ├ ƒ /auth/login                           6.3 kB         250 kB
web:build: ├ ƒ /auth/reactivate                      4.2 kB         248 kB
web:build: ├ ƒ /auth/register                         591 B         241 kB
web:build: ├ ƒ /auth/register-business              6.62 kB         250 kB
web:build: ├ ƒ /auth/reset                          5.36 kB         249 kB
web:build: ├ ƒ /auth/verify                         3.86 kB         247 kB
web:build: ├ ƒ /best-selling                        1.49 kB         249 kB
web:build: ├ ƒ /cart                                4.58 kB        2.54 MB
web:build: ├ ƒ /checkout                              11 kB        2.54 MB
web:build: ├ ƒ /checkout/callback                   1.81 kB         242 kB
web:build: ├ ƒ /checkout/success                    2.43 kB         246 kB
web:build: ├ ƒ /dashboard                           8.76 kB         252 kB
web:build: ├ ƒ /gdip                                5.79 kB         246 kB
web:build: ├ ƒ /gdip/cycles                         5.62 kB         246 kB
web:build: ├ ƒ /gdip/purchase                       6.24 kB         246 kB
web:build: ├ ƒ /gdip/statement                      6.29 kB         246 kB
web:build: ├ ƒ /gdip/tpia/[id]                      5.92 kB         246 kB
web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.4 kB         255 kB
web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing    22.6 kB         263 kB
web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.94 kB         246 kB
web:build: ├ ƒ /gdip/tpias                          4.86 kB         245 kB
web:build: ├ ○ /icon.png                                0 B            0 B
web:build: ├ ƒ /marketplace                           210 B         252 kB
web:build: ├ ƒ /marketplace/[id]                    9.11 kB         261 kB
web:build: ├ ƒ /orders                              7.32 kB         321 kB
web:build: ├ ƒ /orders/[id]                         6.38 kB         254 kB
web:build: ├ ƒ /profile                             17.6 kB        2.54 MB
web:build: ├ ƒ /profile/notifications               4.33 kB         247 kB
web:build: ├ ƒ /profile/reviews                     3.69 kB         110 kB
web:build: ├ ƒ /profile/vouchers                    7.42 kB         251 kB
web:build: ├ ƒ /profile/wallet                      18.1 kB         262 kB
web:build: ├ ƒ /profile/wallet/analytics            7.35 kB         248 kB
web:build: ├ ƒ /profile/wallet/callback             3.86 kB         244 kB
web:build: ├ ƒ /s/[slug]                            3.09 kB         255 kB
web:build: ├ ƒ /s/[slug]/about                        164 B         106 kB
web:build: ├ ƒ /security/fraud-cases                2.45 kB         246 kB
web:build: ├ ƒ /security/report                     2.19 kB         246 kB
web:build: ├ ƒ /security/report/communication       4.55 kB         248 kB
web:build: ├ ƒ /security/report/jobs                4.92 kB         248 kB
web:build: ├ ƒ /security/report/website             4.66 kB         248 kB
web:build: ├ ƒ /sitemap.xml                           125 B         103 kB
web:build: ├ ƒ /support                             5.63 kB         249 kB
web:build: ├ ƒ /verify/[id]                            4 kB         107 kB
web:build: ├ ƒ /wallet/share                         6.7 kB         247 kB
web:build: └ ƒ /wishlist                            3.47 kB         251 kB
web:build: + First Load JS shared by all             103 kB
web:build:   ├ chunks/18-a9171ebc70d5f87b.js        46.5 kB
web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
web:build:   └ other shared chunks (total)          1.94 kB
web:build: 
web:build: 
web:build: ○  (Static)   prerendered as static content
web:build: ƒ  (Dynamic)  server-rendered on demand
web:build: 
web:build: Done in 50.41s.
  Tasks:    1 successful, 1 total
 Cached:    0 cached, 1 total
   Time:    50.956s 
Summary:    /vercel/path0/.turbo/runs/39R6FUNqugmY91JAIaWOKThUEtb.json
Traced Next.js server files in: 36.861ms
Created all serverless functions in: 254.055ms
Collected static files (public/, static/, .next/static): 10.426ms
Build Completed in /vercel/output [1m]
Deploying outputs...
Deployment completed
Creating build cache...
Created build cache: 12.781s
Uploading build cache [404.88 MB]
Build cache uploaded: 5.525s