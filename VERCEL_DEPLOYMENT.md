LATEST:

19:41:48.243 Running build in Washington, D.C., USA (East) – iad1 (Turbo Build Machine)
19:41:48.244 Build machine configuration: 30 cores, 60 GB
19:41:48.346 Cloning github.com/glotrade321/glotrade (Branch: main, Commit: fecd574)
19:41:48.921 Cloning completed: 575.000ms
19:41:49.988 Restored build cache from previous deployment (3cTeRj8tM193WuCxgFWiiHAfGcFq)
19:41:50.230 Running "vercel build"
19:41:50.674 Vercel CLI 50.22.0
19:41:50.777 > Detected Turbo. Adjusting default settings...
19:41:50.912 Running "install" command: `npm install --prefix=../..`...
19:42:23.602 
19:42:23.602 up to date, audited 1157 packages in 32s
19:42:23.602 
19:42:23.602 271 packages are looking for funding
19:42:23.602   run `npm fund` for details
19:42:23.794 
19:42:23.795 41 vulnerabilities (1 low, 1 moderate, 38 high, 1 critical)
19:42:23.795 
19:42:23.795 To address issues that do not require attention, run:
19:42:23.795   npm audit fix
19:42:23.795 
19:42:23.795 To address all issues (including breaking changes), run:
19:42:23.795   npm audit fix --force
19:42:23.795 
19:42:23.795 Run `npm audit` for details.
19:42:23.839 Detected Next.js version: 15.5.12
19:42:23.839 Running "cd ../.. && turbo run build --filter={apps/web}..."
19:42:23.922 
19:42:23.923 Attention:
19:42:23.923 Turborepo now collects completely anonymous telemetry regarding usage.
19:42:23.923 This information is used to shape the Turborepo roadmap and prioritize features.
19:42:23.923 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:42:23.923 https://turborepo.com/docs/telemetry
19:42:23.923 
19:42:23.946  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
19:42:23.946    x Could not resolve workspaces.
19:42:23.946   `-> Lockfile not found at /vercel/path0/yarn.lock
19:42:23.946 
19:42:23.950 • Packages in scope: web
19:42:23.950 • Running build in 1 packages
19:42:23.950 • Remote caching enabled
19:42:24.218 web:build: cache miss, executing 78396a2c67a8bdb7
19:42:24.429 web:build: yarn run v1.22.19
19:42:24.452 web:build: $ next build
19:42:25.378 web:build:    ▲ Next.js 15.5.12
19:42:25.378 web:build:    - Experiments (use with caution):
19:42:25.378 web:build:      · optimizePackageImports
19:42:25.378 web:build: 
19:42:25.481 web:build:    Creating an optimized production build ...
19:42:33.566 web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
19:42:36.531 web:build:  ✓ Compiled successfully in 10.9s
19:42:36.533 web:build:    Skipping linting
19:42:36.533 web:build:    Checking validity of types ...
19:42:50.047 web:build:    Collecting page data ...
19:42:53.470 web:build:    Generating static pages (0/70) ...
19:42:54.483 web:build:    Generating static pages (17/70) 
19:42:54.648 web:build:    Generating static pages (34/70) 
19:42:55.552 web:build:    Generating static pages (52/70) 
19:42:57.069 web:build:  ✓ Generating static pages (70/70)
19:42:59.195 web:build:    Finalizing page optimization ...
19:42:59.196 web:build:    Collecting build traces ...
19:43:07.995 web:build: 
19:43:08.000 web:build: Route (app)                                 Size  First Load JS  Revalidate  Expire
19:43:08.000 web:build: ┌ ○ /                                    6.64 kB         254 kB          1h      1y
19:43:08.000 web:build: ├ ○ /_not-found                            995 B         104 kB
19:43:08.000 web:build: ├ ○ /admin                               12.3 kB         191 kB
19:43:08.000 web:build: ├ ○ /admin/analytics                     5.35 kB         187 kB
19:43:08.000 web:build: ├ ○ /admin/banners                          6 kB         116 kB
19:43:08.000 web:build: ├ ○ /admin/coupons                       8.62 kB         256 kB
19:43:08.000 web:build: ├ ○ /admin/credit-requests                7.7 kB         117 kB
19:43:08.000 web:build: ├ ○ /admin/gdip                          6.93 kB         119 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/commodities              4.27 kB         117 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/cycles                   5.49 kB         115 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/cycles/create            4.69 kB         108 kB
19:43:08.000 web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         115 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/gdcs                     4.91 kB         115 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/partners                 4.55 kB         114 kB
19:43:08.000 web:build: ├ ○ /admin/gdip/tpias                    4.38 kB         116 kB
19:43:08.000 web:build: ├ ○ /admin/orders                         9.5 kB         2.4 MB
19:43:08.000 web:build: ├ ○ /admin/product-managers              4.57 kB         114 kB
19:43:08.000 web:build: ├ ○ /admin/product-managers/new           4.3 kB         114 kB
19:43:08.001 web:build: ├ ○ /admin/products                      6.23 kB         116 kB
19:43:08.001 web:build: ├ ƒ /admin/products/[id]                 7.25 kB        2.54 MB
19:43:08.001 web:build: ├ ○ /admin/products/new                  8.75 kB         260 kB
19:43:08.001 web:build: ├ ○ /admin/reports                       14.7 kB         124 kB
19:43:08.001 web:build: ├ ○ /admin/sales-agents                  6.04 kB         116 kB
19:43:08.001 web:build: ├ ○ /admin/security                      6.54 kB         119 kB
19:43:08.001 web:build: ├ ○ /admin/settings                        13 kB         125 kB
19:43:08.001 web:build: ├ ○ /admin/store                         8.13 kB         255 kB
19:43:08.001 web:build: ├ ○ /admin/users                           12 kB         122 kB
19:43:08.001 web:build: ├ ○ /admin/wallets                       8.97 kB         121 kB
19:43:08.001 web:build: ├ ○ /admin/withdrawals                   7.84 kB         255 kB
19:43:08.001 web:build: ├ ○ /agent/commissions                   5.12 kB         246 kB
19:43:08.001 web:build: ├ ○ /agent/dashboard                     5.19 kB         246 kB
19:43:08.001 web:build: ├ ○ /agent/referrals                     4.88 kB         245 kB
19:43:08.001 web:build: ├ ○ /auth/forgot                         4.92 kB         249 kB
19:43:08.001 web:build: ├ ○ /auth/login                           6.3 kB         250 kB
19:43:08.001 web:build: ├ ○ /auth/reactivate                      4.2 kB         248 kB
19:43:08.001 web:build: ├ ○ /auth/register                         591 B         241 kB
19:43:08.001 web:build: ├ ○ /auth/register-business              6.62 kB         250 kB
19:43:08.001 web:build: ├ ○ /auth/reset                          5.36 kB         249 kB
19:43:08.001 web:build: ├ ○ /auth/verify                         3.86 kB         248 kB
19:43:08.001 web:build: ├ ƒ /best-selling                        1.49 kB         249 kB
19:43:08.002 web:build: ├ ○ /cart                                4.58 kB        2.54 MB
19:43:08.002 web:build: ├ ○ /checkout                            10.9 kB        2.54 MB
19:43:08.002 web:build: ├ ○ /checkout/callback                   1.81 kB         242 kB
19:43:08.002 web:build: ├ ○ /checkout/success                    2.43 kB         246 kB
19:43:08.002 web:build: ├ ○ /dashboard                           8.76 kB         253 kB
19:43:08.002 web:build: ├ ○ /gdip                                5.79 kB         246 kB
19:43:08.002 web:build: ├ ○ /gdip/cycles                         5.62 kB         246 kB
19:43:08.002 web:build: ├ ○ /gdip/purchase                       6.24 kB         247 kB
19:43:08.002 web:build: ├ ○ /gdip/statement                      6.29 kB         247 kB
19:43:08.002 web:build: ├ ƒ /gdip/tpia/[id]                      5.92 kB         246 kB
19:43:08.002 web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.4 kB         255 kB
19:43:08.002 web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing    22.6 kB         263 kB
19:43:08.002 web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.94 kB         246 kB
19:43:08.002 web:build: ├ ○ /gdip/tpias                          4.86 kB         245 kB
19:43:08.002 web:build: ├ ○ /icon.png                                0 B            0 B
19:43:08.002 web:build: ├ ƒ /marketplace                           210 B         253 kB
19:43:08.002 web:build: ├ ƒ /marketplace/[id]                    9.11 kB         261 kB
19:43:08.002 web:build: ├ ○ /orders                              8.13 kB         252 kB
19:43:08.002 web:build: ├ ƒ /orders/[id]                         6.38 kB         255 kB
19:43:08.002 web:build: ├ ○ /profile                             17.6 kB        2.54 MB
19:43:08.002 web:build: ├ ○ /profile/notifications               4.33 kB         247 kB
19:43:08.002 web:build: ├ ○ /profile/reviews                     3.69 kB         110 kB
19:43:08.002 web:build: ├ ○ /profile/vouchers                    7.42 kB         251 kB
19:43:08.002 web:build: ├ ○ /profile/wallet                      18.1 kB         262 kB
19:43:08.002 web:build: ├ ○ /profile/wallet/analytics            7.35 kB         248 kB
19:43:08.002 web:build: ├ ○ /profile/wallet/callback             3.86 kB         244 kB
19:43:08.002 web:build: ├ ƒ /s/[slug]                            3.09 kB         256 kB
19:43:08.002 web:build: ├ ƒ /s/[slug]/about                        164 B         106 kB
19:43:08.002 web:build: ├ ○ /security/fraud-cases                2.45 kB         246 kB
19:43:08.002 web:build: ├ ○ /security/report                     2.19 kB         246 kB
19:43:08.002 web:build: ├ ○ /security/report/communication       4.55 kB         248 kB
19:43:08.002 web:build: ├ ○ /security/report/jobs                4.92 kB         249 kB
19:43:08.002 web:build: ├ ○ /security/report/website             4.66 kB         248 kB
19:43:08.003 web:build: ├ ○ /sitemap.xml                           125 B         103 kB          1h      1y
19:43:08.003 web:build: ├ ○ /support                             5.63 kB         249 kB
19:43:08.003 web:build: ├ ƒ /verify/[id]                            4 kB         107 kB
19:43:08.003 web:build: ├ ○ /wallet/share                         6.7 kB         247 kB
19:43:08.003 web:build: └ ○ /wishlist                            3.47 kB         251 kB
19:43:08.003 web:build: + First Load JS shared by all             103 kB
19:43:08.003 web:build:   ├ chunks/18-7b7d3ef666455fae.js        46.6 kB
19:43:08.003 web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
19:43:08.003 web:build:   └ other shared chunks (total)          2.07 kB
19:43:08.003 web:build: 
19:43:08.003 web:build: 
19:43:08.003 web:build: ○  (Static)   prerendered as static content
19:43:08.003 web:build: ƒ  (Dynamic)  server-rendered on demand
19:43:08.003 web:build: 
19:43:08.045 web:build: Done in 43.62s.
19:43:08.096 
19:43:08.096   Tasks:    1 successful, 1 total
19:43:08.096  Cached:    0 cached, 1 total
19:43:08.096    Time:    44.16s 
19:43:08.096 Summary:    /vercel/path0/.turbo/runs/3A2LbJLGxlnx5EGAmpSSjoXRgqA.json
19:43:08.097 
19:43:16.408 Traced Next.js server files in: 31.769ms
19:43:16.644 Created all serverless functions in: 236.023ms
19:43:16.660 Collected static files (public/, static/, .next/static): 9.736ms
19:43:16.810 Build Completed in /vercel/output [1m]
19:43:16.983 Deploying outputs...
19:43:23.951 Deployment completed
19:43:24.836 Creating build cache...
19:43:37.094 Created build cache: 12s
19:43:37.094 Uploading build cache [430.20 MB]
19:43:43.326 Build cache uploaded: 6.231s



PREVIOUS

Running build in Washington, D.C., USA (East) – iad1 (Turbo Build Machine)
Build machine configuration: 30 cores, 60 GB
Cloning github.com/glotrade321/glotrade (Branch: main, Commit: 1e7867a)
Cloning completed: 563.000ms
Restored build cache from previous deployment (FdcvuHs7oHyrzTAdCjsBaE3exDcB)
Running "vercel build"
Vercel CLI 50.13.2
> Detected Turbo. Adjusting default settings...
Running "install" command: `npm install --prefix=../..`...
added 4 packages, removed 49 packages, changed 49 packages, and audited 1157 packages in 7s
271 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
Detected Next.js version: 15.5.12
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
web:build: cache miss, executing 6ebcbc6e0853348b
web:build: yarn run v1.22.19
web:build: $ next build
web:build:    ▲ Next.js 15.5.12
web:build:    - Experiments (use with caution):
web:build:      · optimizePackageImports
web:build: 
web:build:    Creating an optimized production build ...
web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
web:build:  ✓ Compiled successfully in 16.6s
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
web:build: ├ ƒ /admin                               12.3 kB         191 kB
web:build: ├ ƒ /admin/analytics                     5.35 kB         187 kB
web:build: ├ ƒ /admin/banners                          6 kB         116 kB
web:build: ├ ƒ /admin/coupons                       8.62 kB         256 kB
web:build: ├ ƒ /admin/credit-requests                7.7 kB         117 kB
web:build: ├ ƒ /admin/gdip                          6.93 kB         119 kB
web:build: ├ ƒ /admin/gdip/commodities              4.27 kB         117 kB
web:build: ├ ƒ /admin/gdip/cycles                   5.49 kB         115 kB
web:build: ├ ƒ /admin/gdip/cycles/create            4.69 kB         108 kB
web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         114 kB
web:build: ├ ƒ /admin/gdip/gdcs                     4.91 kB         115 kB
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
web:build: ├ ƒ /admin/wallets                       8.97 kB         121 kB
web:build: ├ ƒ /admin/withdrawals                   7.84 kB         255 kB
web:build: ├ ƒ /agent/commissions                   5.12 kB         245 kB
web:build: ├ ƒ /agent/dashboard                     5.19 kB         246 kB
web:build: ├ ƒ /agent/referrals                     4.88 kB         245 kB
web:build: ├ ƒ /auth/forgot                         4.92 kB         249 kB
web:build: ├ ƒ /auth/login                           6.3 kB         250 kB
web:build: ├ ƒ /auth/reactivate                      4.2 kB         248 kB
web:build: ├ ƒ /auth/register                         591 B         241 kB
web:build: ├ ƒ /auth/register-business              6.62 kB         250 kB
web:build: ├ ƒ /auth/reset                          5.36 kB         249 kB
web:build: ├ ƒ /auth/verify                         3.86 kB         248 kB
web:build: ├ ƒ /best-selling                        1.49 kB         249 kB
web:build: ├ ƒ /cart                                4.58 kB        2.54 MB
web:build: ├ ƒ /checkout                              11 kB        2.54 MB
web:build: ├ ƒ /checkout/callback                   1.81 kB         242 kB
web:build: ├ ƒ /checkout/success                    2.43 kB         246 kB
web:build: ├ ƒ /dashboard                           8.76 kB         253 kB
web:build: ├ ƒ /gdip                                5.79 kB         246 kB
web:build: ├ ƒ /gdip/cycles                         5.62 kB         246 kB
web:build: ├ ƒ /gdip/purchase                       6.24 kB         247 kB
web:build: ├ ƒ /gdip/statement                      6.29 kB         247 kB
web:build: ├ ƒ /gdip/tpia/[id]                      5.92 kB         246 kB
web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.4 kB         255 kB
web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing    22.6 kB         263 kB
web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.94 kB         246 kB
web:build: ├ ƒ /gdip/tpias                          4.86 kB         245 kB
web:build: ├ ○ /icon.png                                0 B            0 B
web:build: ├ ƒ /marketplace                           210 B         253 kB
web:build: ├ ƒ /marketplace/[id]                    9.11 kB         261 kB
web:build: ├ ƒ /orders                              8.13 kB         252 kB
web:build: ├ ƒ /orders/[id]                         6.38 kB         255 kB
web:build: ├ ƒ /profile                             17.6 kB        2.54 MB
web:build: ├ ƒ /profile/notifications               4.33 kB         247 kB
web:build: ├ ƒ /profile/reviews                     3.69 kB         110 kB
web:build: ├ ƒ /profile/vouchers                    7.42 kB         251 kB
web:build: ├ ƒ /profile/wallet                      18.1 kB         262 kB
web:build: ├ ƒ /profile/wallet/analytics            7.35 kB         248 kB
web:build: ├ ƒ /profile/wallet/callback             3.86 kB         244 kB
web:build: ├ ƒ /s/[slug]                            3.09 kB         256 kB
web:build: ├ ƒ /s/[slug]/about                        164 B         106 kB
web:build: ├ ƒ /security/fraud-cases                2.45 kB         246 kB
web:build: ├ ƒ /security/report                     2.19 kB         246 kB
web:build: ├ ƒ /security/report/communication       4.55 kB         248 kB
web:build: ├ ƒ /security/report/jobs                4.92 kB         249 kB
web:build: ├ ƒ /security/report/website             4.66 kB         248 kB
web:build: ├ ƒ /sitemap.xml                           125 B         103 kB
web:build: ├ ƒ /support                             5.63 kB         249 kB
web:build: ├ ƒ /verify/[id]                            4 kB         107 kB
web:build: ├ ƒ /wallet/share                         6.7 kB         247 kB
web:build: └ ƒ /wishlist                            3.47 kB         251 kB
web:build: + First Load JS shared by all             103 kB
web:build:   ├ chunks/18-01c7ceb0bdcf1db3.js        46.6 kB
web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
web:build:   └ other shared chunks (total)          2.07 kB
web:build: 
web:build: 
web:build: ○  (Static)   prerendered as static content
web:build: ƒ  (Dynamic)  server-rendered on demand
web:build: 
web:build: Done in 49.83s.
  Tasks:    1 successful, 1 total
 Cached:    0 cached, 1 total
   Time:    50.283s 
Summary:    /vercel/path0/.turbo/runs/39RGAxAm0qjOJebALvFaaixnyFB.json
Traced Next.js server files in: 43.137ms
Created all serverless functions in: 262.819ms
Collected static files (public/, static/, .next/static): 10.517ms
Build Completed in /vercel/output [1m]
Deploying outputs...
Deployment completed
Creating build cache...
Created build cache: 11.294s
Uploading build cache [405.24 MB]
Build cache uploaded: 9.475s