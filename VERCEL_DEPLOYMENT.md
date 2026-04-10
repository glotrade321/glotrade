22:06:55.826 Running build in Washington, D.C., USA (East) – iad1 (Turbo Build Machine)
22:06:55.826 Build machine configuration: 30 cores, 60 GB
22:06:55.929 Cloning github.com/glotrade321/glotrade (Branch: main, Commit: a02850d)
22:06:56.561 Cloning completed: 632.000ms
22:06:59.420 Restored build cache from previous deployment (SCGW5UitAcHe7rVVdcX2vTZDoPyQ)
22:06:59.643 Running "vercel build"
22:07:00.157 Vercel CLI 50.42.0
22:07:00.245 > Detected Turbo. Adjusting default settings...
22:07:00.416 Running "install" command: `npm install --prefix=../..`...
22:07:55.108 
22:07:55.109 up to date, audited 1157 packages in 54s
22:07:55.109 
22:07:55.109 271 packages are looking for funding
22:07:55.109   run `npm fund` for details
22:07:55.274 
22:07:55.274 20 vulnerabilities (1 low, 3 moderate, 12 high, 4 critical)
22:07:55.274 
22:07:55.274 To address issues that do not require attention, run:
22:07:55.274   npm audit fix
22:07:55.274 
22:07:55.274 To address all issues (including breaking changes), run:
22:07:55.274   npm audit fix --force
22:07:55.274 
22:07:55.274 Run `npm audit` for details.
22:07:55.321 Detected Next.js version: 15.5.12
22:07:55.322 Running "cd ../.. && turbo run build --filter={apps/web}..."
22:07:55.410 
22:07:55.410 Attention:
22:07:55.410 Turborepo now collects completely anonymous telemetry regarding usage.
22:07:55.411 This information is used to shape the Turborepo roadmap and prioritize features.
22:07:55.411 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:07:55.411 https://turborepo.com/docs/telemetry
22:07:55.411 
22:07:55.434  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
22:07:55.434    x Could not resolve workspaces.
22:07:55.434   `-> Lockfile not found at /vercel/path0/yarn.lock
22:07:55.434 
22:07:55.438 • Packages in scope: web
22:07:55.438 • Running build in 1 packages
22:07:55.438 • Remote caching enabled
22:07:55.699 web:build: cache miss, executing 35abfa5a3f7d2303
22:07:55.910 web:build: yarn run v1.22.19
22:07:55.932 web:build: $ next build
22:07:56.880 web:build:    ▲ Next.js 15.5.12
22:07:56.880 web:build:    - Experiments (use with caution):
22:07:56.880 web:build:      · optimizePackageImports
22:07:56.880 web:build: 
22:07:56.980 web:build:    Creating an optimized production build ...
22:08:04.755 web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
22:08:08.196 web:build:  ✓ Compiled successfully in 11.1s
22:08:08.198 web:build:    Skipping linting
22:08:08.198 web:build:    Checking validity of types ...
22:08:22.344 web:build:    Collecting page data ...
22:08:25.820 web:build:    Generating static pages (0/72) ...
22:08:26.805 web:build:  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/admin/managers". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
22:08:26.805 web:build:     at g (/vercel/path0/apps/web/.next/server/chunks/2315.js:9:8772856)
22:08:26.805 web:build:     at m (/vercel/path0/apps/web/.next/server/chunks/2315.js:1:197810)
22:08:26.805 web:build:     at m (/vercel/path0/apps/web/.next/server/app/admin/managers/page.js:1:2937)
22:08:26.805 web:build:     at n3 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:82831)
22:08:26.805 web:build:     at n6 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:84601)
22:08:26.805 web:build:     at n5 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:104801)
22:08:26.805 web:build:     at n7 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:102219)
22:08:26.805 web:build:     at n8 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:83183)
22:08:26.805 web:build:     at n6 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:84647)
22:08:26.805 web:build:     at n6 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:101560)
22:08:26.805 web:build: Error occurred prerendering page "/admin/managers". Read more: https://nextjs.org/docs/messages/prerender-error
22:08:26.805 web:build: Export encountered an error on /admin/managers/page: /admin/managers, exiting the build.
22:08:26.813 web:build:  ⨯ Next.js build worker exited with code: 1 and signal: null
22:08:26.908 web:build: error Command failed with exit code 1.
22:08:26.909 web:build: info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
22:08:26.916 web:build: ERROR: command finished with error: command (/vercel/path0/apps/web) /yarn1/node_modules/yarn/bin/yarn run build exited (1)
22:08:26.916 web#build: command (/vercel/path0/apps/web) /yarn1/node_modules/yarn/bin/yarn run build exited (1)
22:08:26.916 
22:08:26.916   Tasks:    0 successful, 1 total
22:08:26.917  Cached:    0 cached, 1 total
22:08:26.917    Time:    31.494s 
22:08:26.917 Summary:    /vercel/path0/.turbo/runs/3CBO4gcauBMw3sQt03RPkjI6w5e.json
22:08:26.917  Failed:    web#build
22:08:26.917 
22:08:26.918  ERROR  run failed: command  exited (1)
22:08:26.928 Error: Command "cd ../.. && turbo run build --filter={apps/web}..." exited with 1