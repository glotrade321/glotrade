❯ npm run build

> web@1.0.0 build
> next build

   ▲ Next.js 15.5.12
   - Environments: .env.local, .env.production
   - Experiments (use with caution):
     · optimizePackageImports

   Creating an optimized production build ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ✓ Compiled successfully in 31.4s
   Skipping linting
 ✓ Checking validity of types    
 ✓ Collecting page data    
 ✓ Generating static pages (70/70)
 ✓ Collecting build traces    
 ✓ Finalizing page optimization    

Route (app)                                 Size  First Load JS  Revalidate  Expire
┌ ○ /                                    6.62 kB         254 kB          1h      1y
├ ○ /_not-found                            996 B         104 kB
├ ○ /admin                               12.3 kB         191 kB
├ ○ /admin/analytics                     5.32 kB         186 kB
├ ○ /admin/banners                          6 kB         115 kB
├ ○ /admin/coupons                       8.62 kB         255 kB
├ ○ /admin/credit-requests                7.7 kB         117 kB
├ ○ /admin/gdip                          6.93 kB         118 kB
├ ○ /admin/gdip/commodities              4.26 kB         116 kB
├ ○ /admin/gdip/cycles                   5.47 kB         115 kB
├ ○ /admin/gdip/cycles/create            4.67 kB         107 kB
├ ƒ /admin/gdip/gdc/[id]                 4.77 kB         114 kB
├ ○ /admin/gdip/gdcs                     4.89 kB         114 kB
├ ○ /admin/gdip/partners                 4.55 kB         114 kB
├ ○ /admin/gdip/tpias                    4.37 kB         116 kB
├ ○ /admin/orders                         9.5 kB        2.41 MB
├ ○ /admin/product-managers              4.56 kB         114 kB
├ ○ /admin/product-managers/new          4.29 kB         114 kB
├ ○ /admin/products                      6.24 kB         116 kB
├ ƒ /admin/products/[id]                 7.23 kB        2.55 MB
├ ○ /admin/products/new                  8.75 kB         259 kB
├ ○ /admin/reports                       14.7 kB         124 kB
├ ○ /admin/sales-agents                  6.04 kB         115 kB
├ ○ /admin/security                      6.51 kB         119 kB
├ ○ /admin/settings                        13 kB         125 kB
├ ○ /admin/store                         8.13 kB         255 kB
├ ○ /admin/users                         12.1 kB         121 kB
├ ○ /admin/wallets                       8.96 kB         121 kB
├ ○ /admin/withdrawals                   7.85 kB         254 kB
├ ○ /agent/commissions                    5.1 kB         245 kB
├ ○ /agent/dashboard                     5.18 kB         245 kB
├ ○ /agent/referrals                     4.88 kB         245 kB
├ ○ /auth/forgot                         4.92 kB         248 kB
├ ○ /auth/login                           6.3 kB         249 kB
├ ○ /auth/reactivate                      4.2 kB         247 kB
├ ○ /auth/register                         590 B         240 kB
├ ○ /auth/register-business              6.59 kB         250 kB
├ ○ /auth/reset                          5.35 kB         248 kB
├ ○ /auth/verify                         3.85 kB         247 kB
├ ƒ /best-selling                         1.5 kB         248 kB
├ ○ /cart                                4.56 kB        2.55 MB
├ ○ /checkout                              11 kB        2.55 MB
├ ○ /checkout/callback                   1.82 kB         241 kB
├ ○ /checkout/success                    2.43 kB         245 kB
├ ○ /dashboard                           8.72 kB         252 kB
├ ○ /gdip                                5.75 kB         245 kB
├ ○ /gdip/cycles                          5.6 kB         245 kB
├ ○ /gdip/purchase                       6.21 kB         246 kB
├ ○ /gdip/statement                      6.26 kB         246 kB
├ ƒ /gdip/tpia/[id]                      5.88 kB         246 kB
├ ƒ /gdip/tpia/[id]/certificate          14.3 kB         254 kB
├ ƒ /gdip/tpia/[id]/commodity-backing    22.5 kB         262 kB
├ ƒ /gdip/tpia/[id]/invoice              5.91 kB         246 kB
├ ○ /gdip/tpias                          4.84 kB         244 kB
├ ○ /icon.png                                0 B            0 B
├ ƒ /marketplace                           211 B         252 kB
├ ƒ /marketplace/[id]                    9.09 kB         261 kB
├ ○ /orders                              8.12 kB         251 kB
├ ƒ /orders/[id]                         6.37 kB         254 kB
├ ○ /profile                             17.6 kB        2.55 MB
├ ○ /profile/notifications               4.31 kB         246 kB
├ ○ /profile/reviews                     3.67 kB         110 kB
├ ○ /profile/vouchers                     7.4 kB         250 kB
├ ○ /profile/wallet                      18.1 kB         261 kB
├ ○ /profile/wallet/analytics            7.33 kB         247 kB
├ ○ /profile/wallet/callback             3.86 kB         243 kB
├ ƒ /s/[slug]                            3.09 kB         255 kB
├ ƒ /s/[slug]/about                        165 B         106 kB
├ ○ /security/fraud-cases                2.44 kB         245 kB
├ ○ /security/report                     2.19 kB         245 kB
├ ○ /security/report/communication       4.54 kB         248 kB
├ ○ /security/report/jobs                4.92 kB         248 kB
├ ○ /security/report/website             4.66 kB         248 kB
├ ○ /sitemap.xml                           123 B         103 kB          1h      1y
├ ○ /support                             5.62 kB         249 kB
├ ƒ /verify/[id]                         3.99 kB         107 kB
├ ○ /wallet/share                        6.71 kB         246 kB
└ ○ /wishlist                            3.47 kB         250 kB
+ First Load JS shared by all             103 kB
  ├ chunks/18-699b572434d445b7.js        46.3 kB
  ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
  └ other shared chunks (total)          2.07 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand