23:59:46.251 Running build in Washington, D.C., USA (East) – iad1 (Turbo Build Machine)
23:59:46.252 Build machine configuration: 30 cores, 60 GB
23:59:46.340 Cloning github.com/glotrade321/glotrade (Branch: main, Commit: 08630bf)
23:59:46.962 Cloning completed: 621.000ms
23:59:48.770 Restored build cache from previous deployment (Fu6CmbUHy53qYyr6Cs3tJNPVXDj5)
23:59:48.959 Running "vercel build"
23:59:49.463 Vercel CLI 51.6.1
23:59:49.553 > Detected Turbo. Adjusting default settings...
23:59:49.685 Running "install" command: `npm install --prefix=../..`...
00:00:44.516 
00:00:44.517 up to date, audited 1157 packages in 55s
00:00:44.517 
00:00:44.517 271 packages are looking for funding
00:00:44.517   run `npm fund` for details
00:00:44.694 
00:00:44.694 23 vulnerabilities (1 low, 6 moderate, 13 high, 3 critical)
00:00:44.694 
00:00:44.694 To address issues that do not require attention, run:
00:00:44.694   npm audit fix
00:00:44.694 
00:00:44.694 To address all issues (including breaking changes), run:
00:00:44.694   npm audit fix --force
00:00:44.694 
00:00:44.694 Run `npm audit` for details.
00:00:44.754 Detected Next.js version: 15.5.12
00:00:44.755 Running "cd ../.. && turbo run build --filter={apps/web}..."
00:00:44.862 
00:00:44.862 Attention:
00:00:44.862 Turborepo now collects completely anonymous telemetry regarding usage.
00:00:44.862 This information is used to shape the Turborepo roadmap and prioritize features.
00:00:44.863 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
00:00:44.863 https://turborepo.com/docs/telemetry
00:00:44.863 
00:00:44.886  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
00:00:44.887    x Could not resolve workspaces.
00:00:44.887   `-> Lockfile not found at /vercel/path0/yarn.lock
00:00:44.887 
00:00:44.893 • Packages in scope: web
00:00:44.893 • Running build in 1 packages
00:00:44.893 • Remote caching enabled
00:00:45.171 web:build: cache miss, executing 71075e8d64f0e90a
00:00:45.962 web:build: yarn run v1.22.19
00:00:45.985 web:build: $ next build
00:00:46.974 web:build:    ▲ Next.js 15.5.12
00:00:46.975 web:build:    - Experiments (use with caution):
00:00:46.975 web:build:      · optimizePackageImports
00:00:46.975 web:build: 
00:00:47.084 web:build:    Creating an optimized production build ...
00:00:54.281 web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
00:00:54.535 web:build: Browserslist: browsers data (caniuse-lite) is 6 months old. Please run:
00:00:54.536 web:build:   npx update-browserslist-db@latest
00:00:54.536 web:build:   Why you should do it regularly: https://github.com/browserslist/update-db#readme
00:00:57.048 web:build:  ✓ Compiled successfully in 9.8s
00:00:57.051 web:build:    Skipping linting
00:00:57.051 web:build:    Checking validity of types ...
00:01:11.204 web:build:    Collecting page data ...
00:01:14.743 web:build:    Generating static pages (0/72) ...
00:01:15.784 web:build:    Generating static pages (18/72) 
00:01:15.887 web:build:    Generating static pages (36/72) 
00:01:16.014 web:build:    Generating static pages (54/72) 
00:01:16.664 web:build:  ✓ Generating static pages (72/72)
00:01:17.213 web:build:    Finalizing page optimization ...
00:01:17.213 web:build:    Collecting build traces ...
00:01:29.415 web:build: 
00:01:29.419 web:build: Route (app)                                 Size  First Load JS  Revalidate  Expire
00:01:29.419 web:build: ┌ ○ /                                     7.5 kB         262 kB          1h      1y
00:01:29.419 web:build: ├ ○ /_not-found                            995 B         104 kB
00:01:29.419 web:build: ├ ○ /admin                               12.4 kB         192 kB
00:01:29.419 web:build: ├ ○ /admin/analytics                     5.35 kB         187 kB
00:01:29.419 web:build: ├ ○ /admin/banners                       6.08 kB         116 kB
00:01:29.419 web:build: ├ ○ /admin/coupons                       8.64 kB         263 kB
00:01:29.419 web:build: ├ ○ /admin/credit-requests                7.7 kB         118 kB
00:01:29.419 web:build: ├ ○ /admin/gdip                          8.08 kB         266 kB
00:01:29.419 web:build: ├ ○ /admin/gdip/commodities              4.28 kB         117 kB
00:01:29.419 web:build: ├ ○ /admin/gdip/cycles                   5.94 kB         260 kB
00:01:29.419 web:build: ├ ○ /admin/gdip/cycles/create            4.69 kB         108 kB
00:01:29.420 web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         115 kB
00:01:29.420 web:build: ├ ○ /admin/gdip/gdcs                     6.02 kB         260 kB
00:01:29.420 web:build: ├ ○ /admin/gdip/partners                 7.11 kB         117 kB
00:01:29.420 web:build: ├ ○ /admin/gdip/tpias                    5.83 kB         264 kB
00:01:29.420 web:build: ├ ○ /admin/managers                      5.54 kB         115 kB
00:01:29.420 web:build: ├ ○ /admin/managers/new                  4.67 kB         115 kB
00:01:29.420 web:build: ├ ○ /admin/orders                        9.59 kB         2.4 MB
00:01:29.420 web:build: ├ ○ /admin/product-managers                390 B         103 kB
00:01:29.420 web:build: ├ ○ /admin/product-managers/new            389 B         103 kB
00:01:29.420 web:build: ├ ○ /admin/products                      8.27 kB         118 kB
00:01:29.420 web:build: ├ ƒ /admin/products/[id]                 7.29 kB        2.55 MB
00:01:29.420 web:build: ├ ○ /admin/products/new                  8.76 kB         267 kB
00:01:29.420 web:build: ├ ○ /admin/reports                       14.7 kB         125 kB
00:01:29.420 web:build: ├ ○ /admin/sales-agents                  6.04 kB         116 kB
00:01:29.420 web:build: ├ ○ /admin/security                      6.54 kB         119 kB
00:01:29.420 web:build: ├ ○ /admin/settings                        13 kB         125 kB
00:01:29.420 web:build: ├ ○ /admin/store                         8.15 kB         262 kB
00:01:29.420 web:build: ├ ○ /admin/users                           12 kB         122 kB
00:01:29.420 web:build: ├ ○ /admin/wallets                       8.97 kB         121 kB
00:01:29.420 web:build: ├ ○ /admin/withdrawals                   7.84 kB         262 kB
00:01:29.420 web:build: ├ ○ /agent/commissions                   5.12 kB         252 kB
00:01:29.420 web:build: ├ ○ /agent/dashboard                     5.19 kB         252 kB
00:01:29.420 web:build: ├ ○ /agent/referrals                     4.88 kB         252 kB
00:01:29.420 web:build: ├ ○ /auth/forgot                         4.92 kB         255 kB
00:01:29.420 web:build: ├ ○ /auth/login                          6.33 kB         257 kB
00:01:29.421 web:build: ├ ○ /auth/reactivate                      4.2 kB         255 kB
00:01:29.421 web:build: ├ ○ /auth/register                         591 B         248 kB
00:01:29.421 web:build: ├ ○ /auth/register-business              6.62 kB         257 kB
00:01:29.421 web:build: ├ ○ /auth/reset                          5.36 kB         256 kB
00:01:29.421 web:build: ├ ○ /auth/verify                         3.86 kB         254 kB
00:01:29.421 web:build: ├ ƒ /best-selling                        1.49 kB         256 kB
00:01:29.421 web:build: ├ ○ /cart                                4.58 kB        2.55 MB
00:01:29.421 web:build: ├ ○ /checkout                            10.9 kB        2.55 MB
00:01:29.421 web:build: ├ ○ /checkout/callback                   1.81 kB         249 kB
00:01:29.421 web:build: ├ ○ /checkout/success                    2.43 kB         253 kB
00:01:29.421 web:build: ├ ○ /dashboard                           8.76 kB         259 kB
00:01:29.421 web:build: ├ ○ /gdip                                6.18 kB         253 kB
00:01:29.421 web:build: ├ ○ /gdip/cycles                         5.75 kB         253 kB
00:01:29.421 web:build: ├ ○ /gdip/purchase                       6.06 kB         253 kB
00:01:29.421 web:build: ├ ○ /gdip/statement                      6.29 kB         253 kB
00:01:29.421 web:build: ├ ƒ /gdip/tpia/[id]                      6.27 kB         253 kB
00:01:29.421 web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.4 kB         261 kB
00:01:29.421 web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing     1.8 kB         249 kB
00:01:29.421 web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.86 kB         253 kB
00:01:29.421 web:build: ├ ○ /gdip/tpias                          5.08 kB         252 kB
00:01:29.421 web:build: ├ ○ /icon.png                                0 B            0 B
00:01:29.421 web:build: ├ ƒ /marketplace                           210 B         259 kB
00:01:29.421 web:build: ├ ƒ /marketplace/[id]                    9.11 kB         268 kB
00:01:29.421 web:build: ├ ○ /orders                              8.13 kB         259 kB
00:01:29.421 web:build: ├ ƒ /orders/[id]                         6.38 kB         261 kB
00:01:29.421 web:build: ├ ○ /profile                             17.6 kB        2.55 MB
00:01:29.421 web:build: ├ ○ /profile/notifications               4.33 kB         254 kB
00:01:29.421 web:build: ├ ○ /profile/reviews                     3.69 kB         110 kB
00:01:29.421 web:build: ├ ○ /profile/vouchers                    7.42 kB         258 kB
00:01:29.421 web:build: ├ ○ /profile/wallet                      18.1 kB         269 kB
00:01:29.422 web:build: ├ ○ /profile/wallet/analytics            7.35 kB         254 kB
00:01:29.422 web:build: ├ ○ /profile/wallet/callback             3.86 kB         251 kB
00:01:29.422 web:build: ├ ƒ /s/[slug]                            3.09 kB         262 kB
00:01:29.422 web:build: ├ ƒ /s/[slug]/about                        164 B         106 kB
00:01:29.422 web:build: ├ ○ /security/fraud-cases                2.45 kB         253 kB
00:01:29.422 web:build: ├ ○ /security/report                     2.19 kB         253 kB
00:01:29.422 web:build: ├ ○ /security/report/communication       4.55 kB         255 kB
00:01:29.422 web:build: ├ ○ /security/report/jobs                4.92 kB         255 kB
00:01:29.422 web:build: ├ ○ /security/report/website             4.66 kB         255 kB
00:01:29.422 web:build: ├ ○ /sitemap.xml                           125 B         103 kB          1h      1y
00:01:29.422 web:build: ├ ○ /support                             5.63 kB         256 kB
00:01:29.422 web:build: ├ ƒ /verify/[id]                            4 kB         107 kB
00:01:29.422 web:build: ├ ○ /wallet/share                         6.7 kB         254 kB
00:01:29.422 web:build: └ ○ /wishlist                            3.47 kB         258 kB
00:01:29.422 web:build: + First Load JS shared by all             103 kB
00:01:29.422 web:build:   ├ chunks/18-f3d698f906784338.js        46.6 kB
00:01:29.422 web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
00:01:29.422 web:build:   └ other shared chunks (total)          2.07 kB
00:01:29.422 web:build: 
00:01:29.422 web:build: 
00:01:29.422 web:build: ○  (Static)   prerendered as static content
00:01:29.422 web:build: ƒ  (Dynamic)  server-rendered on demand
00:01:29.422 web:build: 
00:01:29.487 web:build: Done in 43.53s.
00:01:29.540 
00:01:29.540   Tasks:    1 successful, 1 total
00:01:29.540  Cached:    0 cached, 1 total
00:01:29.540    Time:    44.663s 
00:01:29.540 Summary:    /vercel/path0/.turbo/runs/3DBkXT6VbXZuE9PXktO3fnyBLzw.json
00:01:29.540 
00:01:37.230 Traced Next.js server files in: 34.443ms
00:01:37.462 Created all serverless functions in: 231.92ms
00:01:37.485 Collected static files (public/, static/, .next/static): 12.792ms
00:01:37.656 Build Completed in /vercel/output [2m]
00:01:37.811 Deploying outputs...
00:01:43.910 Deployment completed
00:01:43.996 Creating build cache...
00:01:56.189 Created build cache: 12s
00:01:56.189 Uploading build cache [399.95 MB]
00:02:04.235 Build cache uploaded: 8.045s