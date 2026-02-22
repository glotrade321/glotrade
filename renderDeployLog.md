2026-02-09T15:35:02.157754113Z ==> Downloading cache...
2026-02-09T15:35:02.310670551Z ==> Cloning from https://github.com/glotrade321/glotrade
2026-02-09T15:35:04.685133369Z ==> Checking out commit 1e7867a4206b7fddda840fa4f497cec8e024b9b3 in branch main
2026-02-09T15:35:35.664104371Z ==> Downloaded 2.2GB in 13s. Extraction took 3s.
2026-02-09T15:36:06.594228892Z #1 [internal] load build definition from Dockerfile
2026-02-09T15:36:07.322477341Z #1 transferring dockerfile:
2026-02-09T15:36:07.475851282Z #1 transferring dockerfile: 1.44kB done
2026-02-09T15:36:07.595633014Z #1 DONE 1.2s
2026-02-09T15:36:07.774280001Z 
2026-02-09T15:36:07.774305752Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2026-02-09T15:36:08.082451034Z #2 ...
2026-02-09T15:36:08.082474055Z 
2026-02-09T15:36:08.082479635Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2026-02-09T15:36:08.082485746Z #3 DONE 0.0s
2026-02-09T15:36:08.23257177Z 
2026-02-09T15:36:08.308077831Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2026-02-09T15:36:13.057805157Z #2 DONE 5.3s
2026-02-09T15:36:13.208713566Z 
2026-02-09T15:36:13.209164619Z #4 [internal] load .dockerignore
2026-02-09T15:36:13.494344942Z #4 transferring context:
2026-02-09T15:36:13.646729924Z #4 transferring context: 2B done
2026-02-09T15:36:14.107947059Z #4 DONE 1.1s
2026-02-09T15:36:14.208486849Z 
2026-02-09T15:36:14.20851217Z #5 [internal] load build context
2026-02-09T15:36:14.20851761Z #5 DONE 0.0s
2026-02-09T15:36:14.20852153Z 
2026-02-09T15:36:14.208526431Z #6 importing cache manifest from local:4865951290437793897
2026-02-09T15:36:14.208531281Z #6 inferred cache manifest type: application/vnd.oci.image.manifest.v1+json done
2026-02-09T15:36:14.208535361Z #6 DONE 0.0s
2026-02-09T15:36:14.208539591Z 
2026-02-09T15:36:14.208544231Z #7 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
2026-02-09T15:36:14.208548871Z #7 resolve docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
2026-02-09T15:36:14.88533656Z #7 resolve docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 0.7s done
2026-02-09T15:36:15.036495726Z #7 DONE 0.7s
2026-02-09T15:36:15.036526057Z 
2026-02-09T15:36:15.036532177Z #5 [internal] load build context
2026-02-09T15:36:15.713017316Z #5 transferring context: 2.17MB 0.2s done
2026-02-09T15:36:16.009314194Z #5 DONE 1.1s
2026-02-09T15:36:16.289679936Z 
2026-02-09T15:36:16.521976787Z #8 [runner 5/8] COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./package.json
2026-02-09T15:36:16.521995318Z #8 CACHED
2026-02-09T15:36:16.521999518Z 
2026-02-09T15:36:16.522004468Z #9 [deps 3/4] COPY apps/api/package.json ./apps/api/
2026-02-09T15:36:16.522008959Z #9 CACHED
2026-02-09T15:36:16.522012908Z 
2026-02-09T15:36:16.522017209Z #10 [builder 2/6] COPY --from=deps /app/node_modules ./node_modules
2026-02-09T15:36:16.522020799Z #10 CACHED
2026-02-09T15:36:16.522024169Z 
2026-02-09T15:36:16.52206928Z #11 [runner 7/8] COPY --from=deps --chown=apiuser:nodejs /app/apps/api/node_modules ./apps_api_modules
2026-02-09T15:36:16.52207725Z #11 CACHED
2026-02-09T15:36:16.52208109Z 
2026-02-09T15:36:16.522085971Z #12 [runner 6/8] COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
2026-02-09T15:36:16.522090421Z #12 CACHED
2026-02-09T15:36:16.522093991Z 
2026-02-09T15:36:16.522097921Z #13 [runner 2/8] RUN addgroup --system --gid 1001 nodejs
2026-02-09T15:36:16.522102231Z #13 CACHED
2026-02-09T15:36:16.522105961Z 
2026-02-09T15:36:16.522110551Z #14 [builder 6/6] RUN yarn build:prod
2026-02-09T15:36:16.522115551Z #14 CACHED
2026-02-09T15:36:16.522119432Z 
2026-02-09T15:36:16.522123552Z #15 [runner 3/8] RUN adduser --system --uid 1001 apiuser
2026-02-09T15:36:16.522145492Z #15 CACHED
2026-02-09T15:36:16.522148112Z 
2026-02-09T15:36:16.522150332Z #16 [deps 2/4] COPY package.json yarn.lock* ./
2026-02-09T15:36:16.522152783Z #16 CACHED
2026-02-09T15:36:16.522155083Z 
2026-02-09T15:36:16.522157843Z #17 [deps 4/4] RUN yarn install --frozen-lockfile
2026-02-09T15:36:16.522160353Z #17 CACHED
2026-02-09T15:36:16.522162673Z 
2026-02-09T15:36:16.522165303Z #18 [builder 5/6] WORKDIR /app/apps/api
2026-02-09T15:36:16.522167733Z #18 CACHED
2026-02-09T15:36:16.522203334Z 
2026-02-09T15:36:16.522207454Z #19 [builder 3/6] COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
2026-02-09T15:36:16.522210454Z #19 CACHED
2026-02-09T15:36:16.522212564Z 
2026-02-09T15:36:16.522215214Z #20 [runner 4/8] COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
2026-02-09T15:36:16.522217514Z #20 CACHED
2026-02-09T15:36:16.522219674Z 
2026-02-09T15:36:16.522222085Z #21 [builder 4/6] COPY apps/api ./apps/api
2026-02-09T15:36:16.522224575Z #21 CACHED
2026-02-09T15:36:16.522226815Z 
2026-02-09T15:36:16.522229995Z #22 [deps 1/4] WORKDIR /app
2026-02-09T15:36:16.522232525Z #22 CACHED
2026-02-09T15:36:16.522234795Z 
2026-02-09T15:36:16.522237395Z #23 [runner 8/8] RUN mkdir -p /app/public/invoices && chown -R apiuser:nodejs /app/public
2026-02-09T15:36:19.329217908Z #23 sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153 3.86MB / 3.86MB 0.2s
2026-02-09T15:36:19.691805427Z #23 sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153 3.86MB / 3.86MB 0.3s done
2026-02-09T15:36:19.896266177Z #23 extracting sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153
2026-02-09T15:36:20.608130087Z #23 extracting sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153 0.7s done
2026-02-09T15:36:21.476955073Z #23 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 7.44MB / 42.78MB 0.2s
2026-02-09T15:36:21.627136671Z #23 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 33.55MB / 42.78MB 0.3s
2026-02-09T15:36:21.777505304Z #23 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 42.78MB / 42.78MB 0.5s
2026-02-09T15:36:22.777500433Z #23 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 42.78MB / 42.78MB 1.3s done
2026-02-09T15:36:23.042536079Z #23 extracting sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80
2026-02-09T15:36:28.181666071Z #23 extracting sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 5.1s done
2026-02-09T15:36:28.394798544Z #23 sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb 1.26MB / 1.26MB 0.0s done
2026-02-09T15:36:28.394820454Z #23 extracting sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb
2026-02-09T15:36:28.956582239Z #23 extracting sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb 0.7s done
2026-02-09T15:36:29.155128996Z #23 sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d 445B / 445B done
2026-02-09T15:36:29.200601552Z #23 extracting sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d
2026-02-09T15:36:32.202536395Z #23 extracting sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d 3.2s done
2026-02-09T15:36:32.408410546Z #23 sha256:a3808bf4578dc9d05cdb45dbd6a8d4ec59cec782109924d80b0727bb9c55c9c9 92B / 92B 0.0s done
2026-02-09T15:36:32.408435857Z #23 extracting sha256:a3808bf4578dc9d05cdb45dbd6a8d4ec59cec782109924d80b0727bb9c55c9c9
2026-02-09T15:36:37.592326979Z #23 extracting sha256:a3808bf4578dc9d05cdb45dbd6a8d4ec59cec782109924d80b0727bb9c55c9c9 5.3s done
2026-02-09T15:36:39.226025229Z #23 sha256:ea60da94da0b8c272835e622d927aace98ab27923cb2d516be62c2bd3b7252bc 462B / 462B 0.2s
2026-02-09T15:36:39.482536356Z #23 sha256:ea60da94da0b8c272835e622d927aace98ab27923cb2d516be62c2bd3b7252bc 462B / 462B 0.3s done
2026-02-09T15:36:39.905428682Z #23 extracting sha256:ea60da94da0b8c272835e622d927aace98ab27923cb2d516be62c2bd3b7252bc
2026-02-09T15:36:43.01465484Z #23 extracting sha256:ea60da94da0b8c272835e622d927aace98ab27923cb2d516be62c2bd3b7252bc 3.1s done
2026-02-09T15:36:43.224685302Z #23 sha256:ebd31dc16c6005aeca5e275319c3e831ef090cd3e232d6026e9fe58c6d5d16db 979B / 979B done
2026-02-09T15:36:43.224707893Z #23 extracting sha256:ebd31dc16c6005aeca5e275319c3e831ef090cd3e232d6026e9fe58c6d5d16db
2026-02-09T15:36:43.708830094Z #23 extracting sha256:ebd31dc16c6005aeca5e275319c3e831ef090cd3e232d6026e9fe58c6d5d16db 0.6s done
2026-02-09T15:36:43.924897192Z #23 sha256:759ca73b19feebe35a9359946f77d965caf51ec578e5859f205a061022f4e448 253.28kB / 253.28kB 0.0s done
2026-02-09T15:36:43.924922272Z #23 extracting sha256:759ca73b19feebe35a9359946f77d965caf51ec578e5859f205a061022f4e448
2026-02-09T15:36:44.498861562Z #23 extracting sha256:759ca73b19feebe35a9359946f77d965caf51ec578e5859f205a061022f4e448 0.7s done
2026-02-09T15:36:44.810140015Z #23 sha256:d8ff4bcf56219b4cfd8cb73b0421d60a59bfd37cb8f7541d8d48aafa7ceb1372 951B / 951B done
2026-02-09T15:36:44.810166135Z #23 extracting sha256:d8ff4bcf56219b4cfd8cb73b0421d60a59bfd37cb8f7541d8d48aafa7ceb1372
2026-02-09T15:36:45.09437802Z #23 extracting sha256:d8ff4bcf56219b4cfd8cb73b0421d60a59bfd37cb8f7541d8d48aafa7ceb1372 0.4s done
2026-02-09T15:36:45.310016225Z #23 sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45 16.78MB / 59.45MB 0.2s
2026-02-09T15:36:45.440643812Z #23 sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45 46.14MB / 59.45MB 0.3s
2026-02-09T15:36:45.59047263Z #23 sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45 59.45MB / 59.45MB 0.5s
2026-02-09T15:36:45.989397767Z #23 sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45 59.45MB / 59.45MB 0.7s done
2026-02-09T15:36:46.03612984Z #23 extracting sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45
2026-02-09T15:36:57.801784467Z #23 extracting sha256:5130c77e4651da218be360800d682211619292b2644460f098c037e9a6eefa45 12.0s done
2026-02-09T15:36:58.008248865Z #23 sha256:a58e942162f28e63f9194f93b34747607409a32be0bd05ce74f39f827ef1d47a 625.82kB / 625.82kB 0.0s done
2026-02-09T15:36:58.008265975Z #23 extracting sha256:a58e942162f28e63f9194f93b34747607409a32be0bd05ce74f39f827ef1d47a
2026-02-09T15:36:58.221800439Z #23 extracting sha256:a58e942162f28e63f9194f93b34747607409a32be0bd05ce74f39f827ef1d47a 0.4s done
2026-02-09T15:36:58.463860635Z #23 sha256:5895e1977869ae21065a47b183e7023bafdde849f22a12a85f4199f48743e05d 144B / 144B done
2026-02-09T15:36:58.463881375Z #23 extracting sha256:5895e1977869ae21065a47b183e7023bafdde849f22a12a85f4199f48743e05d 0.0s done
2026-02-09T15:36:58.476155623Z #23 CACHED
2026-02-09T15:36:58.664499983Z 
2026-02-09T15:36:58.664528984Z #24 exporting to docker image format
2026-02-09T15:36:58.664536954Z #24 exporting layers done
2026-02-09T15:36:58.664544104Z #24 exporting manifest sha256:585b5962ae9b54d67ff41407b91f9a979b6a9535a805e9caedbbf97dcd3ae458 0.0s done
2026-02-09T15:36:58.664549994Z #24 exporting config sha256:c4ce4b5255af72ce2ee70eba8d0e6dba525c4c131cef338e952d0ba06706f2a7 0.0s done
2026-02-09T15:36:59.437320728Z #24 DONE 1.0s
2026-02-09T15:36:59.437347349Z 
2026-02-09T15:36:59.437354229Z #25 exporting cache to client directory
2026-02-09T15:36:59.587651519Z #25 preparing build cache for export
2026-02-09T15:37:01.224345444Z #25 sha256:9d866c7008e9984f4876eab24350c95aef1a1248204b0e8a0e51ec057e3beec0 31.46MB / 59.45MB 0.2s
2026-02-09T15:37:01.371417291Z #25 sha256:9d866c7008e9984f4876eab24350c95aef1a1248204b0e8a0e51ec057e3beec0 59.45MB / 59.45MB 0.3s
2026-02-09T15:37:01.582887864Z #25 sha256:9d866c7008e9984f4876eab24350c95aef1a1248204b0e8a0e51ec057e3beec0 59.45MB / 59.45MB 0.4s done
2026-02-09T15:37:01.582981967Z #25 extracting sha256:9d866c7008e9984f4876eab24350c95aef1a1248204b0e8a0e51ec057e3beec0
2026-02-09T15:37:17.047175999Z #25 extracting sha256:9d866c7008e9984f4876eab24350c95aef1a1248204b0e8a0e51ec057e3beec0 15.6s done
2026-02-09T15:37:17.261487105Z #25 sha256:60bde0e0f016dc8968b4b23ade49e127527f9f715177c7d674ef65b12d4e3404 625.63kB / 625.63kB 0.0s done
2026-02-09T15:37:17.299111492Z #25 extracting sha256:60bde0e0f016dc8968b4b23ade49e127527f9f715177c7d674ef65b12d4e3404
2026-02-09T15:37:17.805560952Z #25 extracting sha256:60bde0e0f016dc8968b4b23ade49e127527f9f715177c7d674ef65b12d4e3404 0.7s done
2026-02-09T15:37:18.013727109Z #25 sha256:e24592dbaee3b11d8effae2947d512d2b3060055b27af09f208aa26b17a823c5 474.62kB / 474.62kB 0.0s done
2026-02-09T15:37:18.030742955Z #25 extracting sha256:e24592dbaee3b11d8effae2947d512d2b3060055b27af09f208aa26b17a823c5
2026-02-09T15:37:18.641577758Z #25 extracting sha256:e24592dbaee3b11d8effae2947d512d2b3060055b27af09f208aa26b17a823c5 0.8s done
2026-02-09T15:37:18.841398222Z #25 sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1 32B / 32B done
2026-02-09T15:37:18.841419133Z #25 extracting sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1
2026-02-09T15:37:18.926886774Z #25 extracting sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1 0.2s done
2026-02-09T15:37:19.147878785Z #25 sha256:0a8eb0b9b54641f4d2b2e4547d1e1de0d94670dd69bc36bfbb1ff869d27d30bc 1.22MB / 1.22MB 0.0s done
2026-02-09T15:37:19.177860869Z #25 extracting sha256:0a8eb0b9b54641f4d2b2e4547d1e1de0d94670dd69bc36bfbb1ff869d27d30bc
2026-02-09T15:37:19.515748046Z #25 extracting sha256:0a8eb0b9b54641f4d2b2e4547d1e1de0d94670dd69bc36bfbb1ff869d27d30bc 0.5s done
2026-02-09T15:37:19.666232402Z #25 sha256:5bd7328eb817006ffe811d6ed68127fa8fa62c6c6d7cde88f380123edb16aa50 413B / 413B done
2026-02-09T15:37:19.825294068Z #25 extracting sha256:5bd7328eb817006ffe811d6ed68127fa8fa62c6c6d7cde88f380123edb16aa50
2026-02-09T15:37:20.406749305Z #25 extracting sha256:5bd7328eb817006ffe811d6ed68127fa8fa62c6c6d7cde88f380123edb16aa50 0.7s done
2026-02-09T15:37:20.620077363Z #25 sha256:21cd1f65b0f2f89bbc99ed92618fd637fb4e26dd87fa15f43bb2999b0cfce083 981B / 981B done
2026-02-09T15:37:20.665550978Z #25 extracting sha256:21cd1f65b0f2f89bbc99ed92618fd637fb4e26dd87fa15f43bb2999b0cfce083
2026-02-09T15:37:21.359517274Z #25 extracting sha256:21cd1f65b0f2f89bbc99ed92618fd637fb4e26dd87fa15f43bb2999b0cfce083 0.9s done
2026-02-09T15:37:21.547551104Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 26.21MB / 506.88MB 0.2s
2026-02-09T15:37:21.696547686Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 58.72MB / 506.88MB 0.3s
2026-02-09T15:37:21.845975372Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 90.18MB / 506.88MB 0.5s
2026-02-09T15:37:21.996011464Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 122.68MB / 506.88MB 0.6s
2026-02-09T15:37:22.145757789Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 156.24MB / 506.88MB 0.8s
2026-02-09T15:37:22.296152242Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 184.55MB / 506.88MB 0.9s
2026-02-09T15:37:22.445718151Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 222.30MB / 506.88MB 1.1s
2026-02-09T15:37:22.595764554Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 254.80MB / 506.88MB 1.2s
2026-02-09T15:37:22.746946691Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 284.16MB / 506.88MB 1.4s
2026-02-09T15:37:22.896418237Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 317.72MB / 506.88MB 1.5s
2026-02-09T15:37:23.045855202Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 349.18MB / 506.88MB 1.7s
2026-02-09T15:37:23.195805473Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 385.88MB / 506.88MB 1.8s
2026-02-09T15:37:23.495983542Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 434.11MB / 506.88MB 2.1s
2026-02-09T15:37:23.79617025Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 478.15MB / 506.88MB 2.4s
2026-02-09T15:37:23.945875874Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 506.88MB / 506.88MB 2.6s
2026-02-09T15:37:29.096747665Z #25 sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 506.88MB / 506.88MB 7.5s done
2026-02-09T15:37:29.5151726Z #25 extracting sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a
2026-02-09T15:38:13.815073223Z #25 extracting sha256:0081cb69c447f54a96cecf25631e6de964fe6f4c6abee78affdb3ad051aba93a 44.3s done
2026-02-09T15:38:13.928618692Z #25 writing cache image manifest sha256:fc58e3a3a04ae1b38637094c58bb12a4e5efc29d85eb23d1c3f15b51baebc832 done
2026-02-09T15:38:13.928635642Z #25 DONE 74.4s
2026-02-09T15:38:14.431350632Z Pushing image to registry...
2026-02-09T15:38:15.17765063Z Upload succeeded
2026-02-09T15:38:39.396911802Z ==> Deploying...
2026-02-09T15:38:39.486833803Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-02-09T15:38:54.295217728Z ℹ️ Redis is disabled. Using memory cache.
2026-02-09T15:38:57.388328815Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:57.388371236Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:57.397270633Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:57.397317754Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:57.685413302Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:57.68573279Z Orange Money credentials not fully configured. Set ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, and ORANGE_MONEY_MERCHANT_CODE
2026-02-09T15:38:59.587705182Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:59.587746453Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:59.590860452Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:59.590989266Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:59.592554285Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:38:59.5927523Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:39:00.297321797Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:39:00.29743473Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:39:00.691585922Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:39:00.691613203Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2026-02-09T15:39:00.698231231Z 🔒 CORS Allowed Origins: [
2026-02-09T15:39:00.698255401Z   'http://glotrade.online',
2026-02-09T15:39:00.698260431Z   'https://glotrade.online',
2026-02-09T15:39:00.698264442Z   'http://www.glotrade.online',
2026-02-09T15:39:00.698268702Z   'https://www.glotrade.online'
2026-02-09T15:39:00.698272752Z ]
2026-02-09T15:39:00.892220598Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"name":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892246149Z (Use `node --trace-warnings ...` to show where the warning was created)
2026-02-09T15:39:00.892250629Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"orderId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.89228077Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"userId":1,"status":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892380482Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"tpiaId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892431374Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"profitDistributed":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892439054Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"userId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892479915Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"code":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892501125Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"reference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.8926863Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"externalReference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:00.892739071Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"reference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2026-02-09T15:39:02.602948893Z 🚀 MongoDB connected successfully
2026-02-09T15:39:02.60323239Z Initializing scheduled jobs...
2026-02-09T15:39:02.88550827Z Scheduled jobs initialized.
2026-02-09T15:39:02.889210114Z 🌐 Server running in production mode on port 8080
2026-02-09T15:39:02.889223795Z 📚 API Documentation: http://localhost:8080/api-docs
2026-02-09T15:39:02.889226975Z 🔒 Security: Helmet enabled
2026-02-09T15:39:02.889230315Z 📝 Logging: Morgan combined mode
2026-02-09T15:39:03.194391206Z ::1 - - [09/Feb/2026:15:39:03 +0000] "HEAD / HTTP/1.1" 200 120 "-" "Go-http-client/1.1"
2026-02-09T15:39:10.881691923Z ==> Your service is live 🎉
2026-02-09T15:39:11.095319894Z ==> 
2026-02-09T15:39:11.09892763Z ==> ///////////////////////////////////////////////////////////
2026-02-09T15:39:11.101184685Z ==> 
2026-02-09T15:39:11.102910506Z ==> Available at your primary URL https://glotradecom.onrender.com
2026-02-09T15:39:11.10489727Z ==> 
2026-02-09T15:39:11.107025014Z ==> ///////////////////////////////////////////////////////////
2026-02-09T15:39:11.286488485Z ::1 - - [09/Feb/2026:15:39:11 +0000] "GET / HTTP/1.1" 200 120 "-" "Go-http-client/2.0"
2026-02-09T15:39:13.685515133Z ::1 - - [09/Feb/2026:15:39:13 +0000] "GET /api/v1/market/products?category=Monitors+%26+Displays&minPrice=100&maxPrice=250&condition=refurbished&sort=-price&ratingMin=4.5&etaMaxDays=2&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:13.790196852Z ::1 - - [09/Feb/2026:15:39:13 +0000] "GET /api/v1/market/products?category=Eye+Makeup&attr_size=S&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:14.184894587Z ::1 - - [09/Feb/2026:15:39:14 +0000] "GET /api/v1/market/products?category=Laptop+Backpacks&minPrice=100&maxPrice=250&condition=refurbished&sort=-views&ratingMin=4&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:14.186146519Z ::1 - - [09/Feb/2026:15:39:14 +0000] "GET /api/v1/market/products?category=Infant+Formula&minPrice=0&maxPrice=20&sort=-price&ratingMin=4.5&etaMaxDays=2&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:15.991284582Z ::1 - - [09/Feb/2026:15:39:15 +0000] "GET /api/v1/market/products?category=Media+Players&minPrice=250&maxPrice=5000&condition=new&ratingMin=4.5&etaMaxDays=2&discountMin=30&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:16.284424858Z ::1 - - [09/Feb/2026:15:39:16 +0000] "GET /api/v1/market/products?category=Filing+Cabinets&condition=new&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:16.289303782Z ::1 - - [09/Feb/2026:15:39:16 +0000] "GET /api/v1/market/products?category=Briefcases&condition=new&sort=-price&ratingMin=3&freeShipping=true&discountMin=20&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:18.892305611Z ::1 - - [09/Feb/2026:15:39:18 +0000] "GET /api/v1/market/products?category=Flower+Seeds&minPrice=20&maxPrice=50&ratingMin=5&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.29222523Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Children%27s+Books&minPrice=100&maxPrice=250&sort=price&ratingMin=4&discountMin=20&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.386541215Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Camping+%26+Hiking&minPrice=100&maxPrice=250&condition=used&ratingMin=4&etaMaxDays=2&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.388384952Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Hand+Tools&condition=used&sort=price&ratingMin=4.5&etaMaxDays=3&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.390032404Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Educational+Books&minPrice=250&maxPrice=5000&condition=refurbished&ratingMin=5&etaMaxDays=2&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.484275698Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Football+%26+Soccer&minPrice=50&maxPrice=100&etaMaxDays=2&discountMin=50&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.585037607Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Fishing&minPrice=20&maxPrice=50&condition=refurbished&sort=-createdAt&ratingMin=5&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:19.586043523Z ::1 - - [09/Feb/2026:15:39:19 +0000] "GET /api/v1/market/products?category=Dog+Grooming&condition=refurbished&ratingMin=3&etaMaxDays=7&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:21.88424382Z ::1 - - [09/Feb/2026:15:39:21 +0000] "GET /api/v1/market/products?category=Fish+%26+Aquarium&freeShipping=true&attr_anc=ANC&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.285875672Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Luxury+Watches&minPrice=20&maxPrice=50&ratingMin=4&etaMaxDays=2&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.288522369Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Sofas+%26+Couches&sort=-views&ratingMin=5&freeShipping=true&etaMaxDays=2&discountMin=30&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.38500767Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Men%27s+Accessories&minPrice=0&maxPrice=20&ratingMin=4&discountMin=20&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.684004995Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Food+Storage&condition=new&ratingMin=4.5&etaMaxDays=2&attr_storage=64GB&attr_ram=8GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.685855721Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Tea+%26+Coffee&minPrice=100&maxPrice=250&sort=price&ratingMin=4&discountMin=50&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.686809676Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Towels&condition=used&ratingMin=3&attr_ram=4GB&attr_storage=512GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.687627687Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Food+Storage&condition=used&sort=-createdAt&ratingMin=4.5&etaMaxDays=2&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:22.693487255Z ::1 - - [09/Feb/2026:15:39:22 +0000] "GET /api/v1/market/products?category=Air+Fryers&minPrice=20&maxPrice=50&sort=-views&ratingMin=4&etaMaxDays=2&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:23.813164776Z ::1 - - [09/Feb/2026:15:39:23 +0000] "GET /api/v1/market/products?category=Vinyl+Records&sort=price&ratingMin=3&etaMaxDays=2&discountMin=50&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:24.985752672Z ::1 - - [09/Feb/2026:15:39:24 +0000] "GET /api/v1/market/products?category=Soundbars&condition=used&sort=-createdAt&ratingMin=4.5&etaMaxDays=2&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:24.988911972Z ::1 - - [09/Feb/2026:15:39:24 +0000] "GET /api/v1/market/products?category=Duffel+Bags&ratingMin=3&attr_size=S&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:24.989816735Z ::1 - - [09/Feb/2026:15:39:24 +0000] "GET /api/v1/market/products?category=Men%27s+Rings&sort=-views&ratingMin=5&freeShipping=true&discountMin=50&attr_ram=16GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:25.484681485Z ::1 - - [09/Feb/2026:15:39:25 +0000] "GET /api/v1/market/products?category=Audio+Accessories&ratingMin=4.5&etaMaxDays=2&discountMin=20&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:25.584756867Z ::1 - - [09/Feb/2026:15:39:25 +0000] "GET /api/v1/market/products?category=Mirrorless+Cameras&condition=used&ratingMin=5&etaMaxDays=2&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:25.585909746Z ::1 - - [09/Feb/2026:15:39:25 +0000] "GET /api/v1/market/products?category=Vacuum+Cleaners&condition=used&ratingMin=3&freeShipping=true&etaMaxDays=2&discountMin=20&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:26.484671226Z ::1 - - [09/Feb/2026:15:39:26 +0000] "GET /api/v1/market/products?category=Video+Games&condition=refurbished&ratingMin=4&etaMaxDays=7&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:27.094906416Z ::1 - - [09/Feb/2026:15:39:27 +0000] "GET /api/v1/market/products?category=Flower+Seeds&etaMaxDays=2&attr_storage=512GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:27.095582534Z ::1 - - [09/Feb/2026:15:39:27 +0000] "GET /api/v1/market/products?category=Small+Animal+Supplies&condition=used&sort=price&ratingMin=3&etaMaxDays=3&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:27.096320872Z ::1 - - [09/Feb/2026:15:39:27 +0000] "GET /api/v1/market/products?category=Cat+Accessories&condition=new&sort=price&ratingMin=3&freeShipping=true&etaMaxDays=2&discountMin=10&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:27.287298614Z ::1 - - [09/Feb/2026:15:39:27 +0000] "GET /api/v1/market/products?category=Interior+Accessories&minPrice=250&maxPrice=5000&condition=used&ratingMin=4.5&etaMaxDays=3&discountMin=30&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:28.090087375Z ::1 - - [09/Feb/2026:15:39:28 +0000] "GET /api/v1/market/products?category=Hard+Hats&minPrice=100&maxPrice=250&sort=-price&ratingMin=4&discountMin=30&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:28.184523254Z ::1 - - [09/Feb/2026:15:39:28 +0000] "GET /api/v1/market/products?category=Motorcycle+Accessories&condition=used&sort=-views&ratingMin=4.5&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:28.485579091Z ::1 - - [09/Feb/2026:15:39:28 +0000] "GET /api/v1/market/products?category=Safety+Boots&minPrice=20&maxPrice=50&sort=-price&ratingMin=4.5&etaMaxDays=3&discountMin=20&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:28.965225095Z ::1 - - [09/Feb/2026:15:39:28 +0000] "GET /api/v1/market/products?category=T-Shirts&minPrice=100&maxPrice=250&condition=refurbished&ratingMin=5&etaMaxDays=3&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:30.191302199Z ::1 - - [09/Feb/2026:15:39:30 +0000] "GET /api/v1/market/products?category=Pillows&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:30.191846882Z ::1 - - [09/Feb/2026:15:39:30 +0000] "GET /api/v1/market/products?category=Vases+%26+Planters&condition=refurbished&ratingMin=4&etaMaxDays=2&discountMin=30&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:30.485917252Z ::1 - - [09/Feb/2026:15:39:30 +0000] "GET /api/v1/market/products?category=Earbuds+%26+Earphones&minPrice=0&maxPrice=20&sort=price&ratingMin=4.5&etaMaxDays=2&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:30.486657711Z ::1 - - [09/Feb/2026:15:39:30 +0000] "GET /api/v1/market/products?category=Earbuds+%26+Earphones&sort=-createdAt&ratingMin=3&freeShipping=true&etaMaxDays=7&discountMin=30&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:30.487343298Z ::1 - - [09/Feb/2026:15:39:30 +0000] "GET /api/v1/market/products?category=Duffel+Bags&minPrice=20&maxPrice=50&condition=used&ratingMin=3&etaMaxDays=7&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:31.616891Z ::1 - - [09/Feb/2026:15:39:31 +0000] "GET /api/v1/market/products?category=Riding+Gear&condition=used&sort=price&ratingMin=4.5&etaMaxDays=2&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:31.772268137Z ::1 - - [09/Feb/2026:15:39:31 +0000] "GET /api/v1/market/products?category=Anti-Aging&minPrice=100&maxPrice=250&condition=new&sort=-views&etaMaxDays=2&discountMin=10&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:32.05585923Z ::1 - - [09/Feb/2026:15:39:32 +0000] "GET /api/v1/market/products?category=Scarves+%26+Shawls&attr_anc=ANC&attr_size=L&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:32.186627352Z ::1 - - [09/Feb/2026:15:39:32 +0000] "GET /api/v1/market/products?category=Screen+Protectors&minPrice=20&maxPrice=50&condition=used&ratingMin=3&discountMin=50&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:32.861164896Z ::1 - - [09/Feb/2026:15:39:32 +0000] "GET /api/v1/market/products?category=Luxury+Watches&condition=used&ratingMin=4.5&etaMaxDays=2&discountMin=30&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:33.484237323Z ::1 - - [09/Feb/2026:15:39:33 +0000] "GET /api/v1/market/products?category=Jeans&minPrice=20&maxPrice=50&condition=new&ratingMin=3&etaMaxDays=2&discountMin=50&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:33.685498705Z ::1 - - [09/Feb/2026:15:39:33 +0000] "GET /api/v1/market/products?category=Sports+Accessories&condition=used&ratingMin=3&etaMaxDays=3&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:34.088490072Z ::1 - - [09/Feb/2026:15:39:34 +0000] "GET /api/v1/market/products?category=Car+Electronics&ratingMin=4&attr_size=13%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:34.153530313Z ::1 - - [09/Feb/2026:15:39:34 +0000] "GET /api/v1/market/products?category=Plus+Size+Men&minPrice=100&maxPrice=250&sort=-createdAt&ratingMin=3&etaMaxDays=7&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:34.885335242Z ::1 - - [09/Feb/2026:15:39:34 +0000] "GET /api/v1/market/products?category=Kids+Clothing&condition=new&sort=price&ratingMin=4.5&etaMaxDays=3&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:35.288739489Z ::1 - - [09/Feb/2026:15:39:35 +0000] "GET /api/v1/market/products?category=Smart+Plugs+%26+Switches&condition=refurbished&sort=-createdAt&ratingMin=5&freeShipping=true&etaMaxDays=3&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:35.46595075Z ::1 - - [09/Feb/2026:15:39:35 +0000] "GET /api/v1/market/products?category=Laptop+Backpacks&minPrice=0&maxPrice=20&sort=price&ratingMin=3&etaMaxDays=2&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:35.885440746Z ::1 - - [09/Feb/2026:15:39:35 +0000] "GET /api/v1/market/products?category=Air+Fryers&minPrice=0&maxPrice=20&sort=-views&ratingMin=3&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:36.555511697Z ::1 - - [09/Feb/2026:15:39:36 +0000] "GET /api/v1/market/products?category=Candy+%26+Chocolate&condition=new&sort=-createdAt&ratingMin=4.5&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:36.858865592Z ::1 - - [09/Feb/2026:15:39:36 +0000] "GET /api/v1/market/products?category=Bird+Supplies&condition=refurbished&etaMaxDays=7&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:37.185265883Z ::1 - - [09/Feb/2026:15:39:37 +0000] "GET /api/v1/market/products?category=Men%27s+Clothing&minPrice=20&maxPrice=50&condition=new&ratingMin=5&etaMaxDays=7&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:37.689099201Z ::1 - - [09/Feb/2026:15:39:37 +0000] "GET /api/v1/market/products?category=Rings&condition=used&sort=-createdAt&ratingMin=3&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:38.654622276Z ::1 - - [09/Feb/2026:15:39:38 +0000] "GET /api/v1/market/products?category=VR+Headsets&minPrice=20&maxPrice=50&sort=-views&ratingMin=3&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:38.986623559Z ::1 - - [09/Feb/2026:15:39:38 +0000] "GET /api/v1/market/products?category=Circuit+Breakers&etaMaxDays=7&attr_storage=128GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:38.987165603Z ::1 - - [09/Feb/2026:15:39:38 +0000] "GET /api/v1/market/products?category=Men%27s+Necklaces&minPrice=20&maxPrice=50&ratingMin=5&discountMin=10&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:39.053421326Z ::1 - - [09/Feb/2026:15:39:39 +0000] "GET /api/v1/market/products?category=Dryers&condition=new&ratingMin=4&etaMaxDays=2&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:39.28782531Z ::1 - - [09/Feb/2026:15:39:39 +0000] "GET /api/v1/market/products?category=Candles+%26+Holders&condition=refurbished&ratingMin=5&freeShipping=true&discountMin=50&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:40.388457907Z ::1 - - [09/Feb/2026:15:39:40 +0000] "GET /api/v1/market/products?category=Men%27s+Clothing&minPrice=50&maxPrice=100&condition=new&sort=-views&ratingMin=3&etaMaxDays=2&discountMin=50&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:40.461429511Z ::1 - - [09/Feb/2026:15:39:40 +0000] "GET /api/v1/market/products?category=Pillows&minPrice=50&maxPrice=100&ratingMin=3&discountMin=50&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:40.890758066Z ::1 - - [09/Feb/2026:15:39:40 +0000] "GET /api/v1/market/products?category=Women%27s+Clothing&minPrice=100&maxPrice=250&sort=-createdAt&ratingMin=4&etaMaxDays=2&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:41.896432762Z ::1 - - [09/Feb/2026:15:39:41 +0000] "GET /api/v1/market/products?category=Scarves+%26+Shawls&minPrice=100&maxPrice=250&condition=new&sort=-views&ratingMin=3&etaMaxDays=2&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:41.985105364Z ::1 - - [09/Feb/2026:15:39:41 +0000] "GET /api/v1/market/products?category=VR+Headsets&attr_size=S&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:42.886740897Z ::1 - - [09/Feb/2026:15:39:42 +0000] "GET /api/v1/market/products?category=Power+Tools&condition=refurbished&sort=-createdAt&ratingMin=5&freeShipping=true&etaMaxDays=3&discountMin=30&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:42.984071349Z ::1 - - [09/Feb/2026:15:39:42 +0000] "GET /api/v1/market/products?category=Lip+Makeup&minPrice=100&maxPrice=250&condition=new&sort=-createdAt&ratingMin=5&etaMaxDays=3&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:43.890724599Z ::1 - - [09/Feb/2026:15:39:43 +0000] "GET /api/v1/market/products?category=Smart+Lighting&condition=refurbished&sort=-views&etaMaxDays=3&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:43.955486464Z ::1 - - [09/Feb/2026:15:39:43 +0000] "GET /api/v1/market/products?category=Cat+Toys&condition=used&sort=-views&ratingMin=5&freeShipping=true&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:44.192448393Z ::1 - - [09/Feb/2026:15:39:44 +0000] "GET /api/v1/market/products?category=Office+Desks&condition=used&ratingMin=3&attr_ram=4GB&attr_storage=512GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:44.285544048Z ::1 - - [09/Feb/2026:15:39:44 +0000] "GET /api/v1/market/products?category=Baby+Girl+Clothing&minPrice=0&maxPrice=20&sort=-price&ratingMin=4.5&etaMaxDays=7&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:45.083939038Z ::1 - - [09/Feb/2026:15:39:44 +0000] "GET /api/v1/market/products?category=Cat+Food&discountMin=50&attr_size=L&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:45.685780465Z ::1 - - [09/Feb/2026:15:39:45 +0000] "GET /api/v1/market/products?category=Drums+%26+Percussion&condition=refurbished&sort=price&ratingMin=4.5&etaMaxDays=3&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:45.886440612Z ::1 - - [09/Feb/2026:15:39:45 +0000] "GET /api/v1/market/products?category=Motorcycle+Parts&condition=new&ratingMin=3&freeShipping=true&etaMaxDays=3&discountMin=10&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:45.955356533Z ::1 - - [09/Feb/2026:15:39:45 +0000] "GET /api/v1/market/products?category=Power+Tools&condition=refurbished&sort=price&ratingMin=3&discountMin=10&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.183909661Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Dining+Tables&etaMaxDays=3&attr_brand=Aurora&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.185255715Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Lights+%26+Bulbs&minPrice=50&maxPrice=100&sort=-createdAt&ratingMin=3&etaMaxDays=3&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.186112627Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Hats+%26+Caps&minPrice=100&maxPrice=250&sort=-price&ratingMin=3&etaMaxDays=7&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.186807604Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Gaming+Accessories&condition=refurbished&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.187488302Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Men%27s+Watches&condition=new&sort=price&ratingMin=5&etaMaxDays=2&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:48.356735121Z ::1 - - [09/Feb/2026:15:39:48 +0000] "GET /api/v1/market/products?category=Dog+Accessories&condition=new&ratingMin=4&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:49.077965091Z ::1 - - [09/Feb/2026:15:39:49 +0000] "GET /api/v1/market/products?category=Messenger+Bags&condition=refurbished&ratingMin=3&freeShipping=true&etaMaxDays=7&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:49.512619231Z ::1 - - [09/Feb/2026:15:39:49 +0000] "GET /api/v1/market/products?category=Laptop+Bags&condition=refurbished&sort=-views&ratingMin=5&freeShipping=true&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:49.784793455Z ::1 - - [09/Feb/2026:15:39:49 +0000] "GET /api/v1/market/products?category=Power+Banks&ratingMin=3&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:49.789282989Z ::1 - - [09/Feb/2026:15:39:49 +0000] "GET /api/v1/market/products?category=Air+Conditioners&minPrice=100&maxPrice=250&condition=refurbished&sort=-price&ratingMin=3&etaMaxDays=2&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:50.885258768Z ::1 - - [09/Feb/2026:15:39:50 +0000] "GET /api/v1/market/products?category=Cutlery&freeShipping=false&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:50.886642043Z ::1 - - [09/Feb/2026:15:39:50 +0000] "GET /api/v1/market/products?category=Motor+Oils&condition=used&ratingMin=5&attr_ram=4GB&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:50.887238748Z ::1 - - [09/Feb/2026:15:39:50 +0000] "GET /api/v1/market/products?category=Men%27s+Grooming&minPrice=0&maxPrice=20&condition=refurbished&sort=-views&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:51.657954065Z ::1 - - [09/Feb/2026:15:39:51 +0000] "GET /api/v1/market/products?category=Hair+Accessories&minPrice=20&maxPrice=50&condition=refurbished&ratingMin=4&discountMin=10&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:52.885938648Z ::1 - - [09/Feb/2026:15:39:52 +0000] "GET /api/v1/market/products?category=Basketball&ratingMin=5&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:52.888549194Z ::1 - - [09/Feb/2026:15:39:52 +0000] "GET /api/v1/market/products?category=Lingerie+%26+Sleepwear&condition=new&sort=-views&ratingMin=4.5&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:52.889514488Z ::1 - - [09/Feb/2026:15:39:52 +0000] "GET /api/v1/market/products?category=VR+Headsets&ratingMin=4&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:52.990697898Z ::1 - - [09/Feb/2026:15:39:52 +0000] "GET /api/v1/market/products?category=Safety+Glasses&minPrice=50&maxPrice=100&condition=refurbished&ratingMin=5&etaMaxDays=2&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:53.058252865Z ::1 - - [09/Feb/2026:15:39:53 +0000] "GET /api/v1/market/products?category=Bed+Sheets&condition=new&ratingMin=5&etaMaxDays=3&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:53.26278789Z ::1 - - [09/Feb/2026:15:39:53 +0000] "GET /api/v1/market/products?category=Pesticides&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:53.85449342Z ::1 - - [09/Feb/2026:15:39:53 +0000] "GET /api/v1/market/products?category=Earbuds+%26+Earphones&condition=used&sort=-views&etaMaxDays=7&discountMin=50&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:55.089260564Z ::1 - - [09/Feb/2026:15:39:55 +0000] "GET /api/v1/market/products?category=Monitors+%26+Displays&minPrice=100&maxPrice=250&condition=used&ratingMin=3&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:55.496272213Z ::1 - - [09/Feb/2026:15:39:55 +0000] "GET /api/v1/market/products?category=Children%27s+Books&discountMin=10&attr_size=M&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:55.584555585Z ::1 - - [09/Feb/2026:15:39:55 +0000] "GET /api/v1/market/products?category=Tennis+%26+Badminton&minPrice=20&maxPrice=50&condition=new&sort=-views&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:55.587313695Z ::1 - - [09/Feb/2026:15:39:55 +0000] "GET /api/v1/market/products?category=Men%27s+Necklaces&condition=new&sort=-createdAt&ratingMin=3&etaMaxDays=7&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:55.588525936Z ::1 - - [09/Feb/2026:15:39:55 +0000] "GET /api/v1/market/products?category=Shoulder+Bags&attr_size=15%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:56.562608169Z ::1 - - [09/Feb/2026:15:39:56 +0000] "GET /api/v1/market/products?category=Infant+Formula&minPrice=100&maxPrice=250&ratingMin=5&freeShipping=true&discountMin=50&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:56.887922032Z ::1 - - [09/Feb/2026:15:39:56 +0000] "GET /api/v1/market/products?category=Soundbars&condition=refurbished&ratingMin=4&etaMaxDays=7&discountMin=30&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:57.291606896Z ::1 - - [09/Feb/2026:15:39:57 +0000] "GET /api/v1/market/products?category=Volleyball&minPrice=0&maxPrice=20&ratingMin=5&etaMaxDays=7&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:57.889884973Z ::1 - - [09/Feb/2026:15:39:57 +0000] "GET /api/v1/market/products?category=Wallets+%26+Purses&minPrice=250&maxPrice=5000&condition=new&sort=-views&ratingMin=3&etaMaxDays=2&discountMin=50&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:58.087095713Z ::1 - - [09/Feb/2026:15:39:58 +0000] "GET /api/v1/market/products?category=DSLR+Cameras&ratingMin=5&etaMaxDays=7&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:58.087895843Z ::1 - - [09/Feb/2026:15:39:58 +0000] "GET /api/v1/market/products?category=Electrical+Cables&ratingMin=4&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:58.285282007Z ::1 - - [09/Feb/2026:15:39:58 +0000] "GET /api/v1/market/products?category=Yoga+%26+Pilates&condition=refurbished&ratingMin=5&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:58.852960966Z ::1 - - [09/Feb/2026:15:39:58 +0000] "GET /api/v1/market/products?category=Nuts+%26+Dried+Fruits&condition=refurbished&ratingMin=5&discountMin=30&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:59.492986294Z ::1 - - [09/Feb/2026:15:39:59 +0000] "GET /api/v1/market/products?category=Livestock+Feed&minPrice=20&maxPrice=50&ratingMin=4&etaMaxDays=2&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:59.895781665Z ::1 - - [09/Feb/2026:15:39:59 +0000] "GET /api/v1/market/products?category=Gloves&condition=refurbished&ratingMin=4.5&etaMaxDays=3&discountMin=50&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:59.986977762Z ::1 - - [09/Feb/2026:15:39:59 +0000] "GET /api/v1/market/products?category=Smart+Watches&condition=used&sort=-views&ratingMin=5&freeShipping=true&etaMaxDays=2&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:39:59.987859374Z ::1 - - [09/Feb/2026:15:39:59 +0000] "GET /api/v1/market/products?category=Plus+Size+Men&attr_anc=Passive&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:00.159002961Z ::1 - - [09/Feb/2026:15:40:00 +0000] "GET /api/v1/market/products?category=Filing+Cabinets&minPrice=100&maxPrice=250&sort=-price&ratingMin=5&etaMaxDays=3&discountMin=10&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:00.384740125Z ::1 - - [09/Feb/2026:15:40:00 +0000] "GET /api/v1/market/products?category=Cat+Accessories&attr_size=XL&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:00.885794063Z ::1 - - [09/Feb/2026:15:40:00 +0000] "GET /api/v1/market/products?category=Checked+Luggage&minPrice=20&maxPrice=50&ratingMin=5&etaMaxDays=2&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:01.987761284Z ::1 - - [09/Feb/2026:15:40:01 +0000] "GET /api/v1/market/products?category=Hats+%26+Caps&minPrice=0&maxPrice=20&condition=used&ratingMin=3&etaMaxDays=7&discountMin=30&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:01.988846172Z ::1 - - [09/Feb/2026:15:40:01 +0000] "GET /api/v1/market/products?category=Men%27s+Sportswear&minPrice=100&maxPrice=250&sort=-views&ratingMin=3&etaMaxDays=7&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:02.097293276Z ::1 - - [09/Feb/2026:15:40:02 +0000] "GET /api/v1/market/products?category=Personal+Health&condition=refurbished&attr_storage=512GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:02.159890436Z ::1 - - [09/Feb/2026:15:40:02 +0000] "GET /api/v1/market/products?category=Headphones&condition=new&ratingMin=4&etaMaxDays=2&attr_storage=64GB&attr_ram=16GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:02.693004998Z ::1 - - [09/Feb/2026:15:40:02 +0000] "GET /api/v1/market/products?category=Sports+Accessories&minPrice=0&maxPrice=20&condition=new&ratingMin=5&etaMaxDays=2&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:02.758701827Z ::1 - - [09/Feb/2026:15:40:02 +0000] "GET /api/v1/market/products?category=Dining+Tables&ratingMin=4.5&attr_size=15%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.094471277Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?category=Wardrobes&condition=refurbished&ratingMin=3&attr_color=White&attr_ram=16GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.288901185Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?category=Educational+Books&condition=new&attr_ram=8GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.292595469Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?category=Plus+Size+Women&minPrice=100&maxPrice=250&ratingMin=4&etaMaxDays=2&discountMin=20&attr_storage=256GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.293705318Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?condition=new&ratingMin=4.5&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.294325083Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?category=Cleaning+Tools&condition=new&sort=-views&ratingMin=3&etaMaxDays=2&attr_storage=64GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:04.355953149Z ::1 - - [09/Feb/2026:15:40:04 +0000] "GET /api/v1/market/products?category=Keyboards+%26+Mice&attr_size=S&attr_storage=512GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:05.487615354Z ::1 - - [09/Feb/2026:15:40:05 +0000] "GET /api/v1/market/products?category=DSLR+Cameras&minPrice=20&maxPrice=50&sort=-price&ratingMin=4&etaMaxDays=7&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:06.586304982Z ::1 - - [09/Feb/2026:15:40:06 +0000] "GET /api/v1/market/products?category=Safety+Boots&minPrice=50&maxPrice=100&condition=refurbished&sort=-createdAt&ratingMin=4&etaMaxDays=7&discountMin=20&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:06.787312918Z ::1 - - [09/Feb/2026:15:40:06 +0000] "GET /api/v1/market/products?category=Seedlings+%26+Saplings&minPrice=0&maxPrice=20&sort=-views&ratingMin=5&attr_size=14%22&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:06.787942304Z ::1 - - [09/Feb/2026:15:40:06 +0000] "GET /api/v1/market/products?category=Rice+Cookers&discountMin=50&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:06.788535119Z ::1 - - [09/Feb/2026:15:40:06 +0000] "GET /api/v1/market/products?category=Cleaning+Tools&minPrice=100&maxPrice=250&condition=used&ratingMin=4.5&etaMaxDays=2&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:06.79170433Z ::1 - - [09/Feb/2026:15:40:06 +0000] "GET /api/v1/market/products?category=Smart+Plugs+%26+Switches&freeShipping=true&attr_anc=Passive&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:07.985124424Z ::1 - - [09/Feb/2026:15:40:07 +0000] "GET /api/v1/market/products?category=Irons+%26+Steamers&minPrice=100&maxPrice=250&condition=refurbished&sort=-createdAt&ratingMin=5&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:08.986875809Z ::1 - - [09/Feb/2026:15:40:08 +0000] "GET /api/v1/market/products?category=Media+Players&condition=used&sort=-createdAt&ratingMin=4&etaMaxDays=3&attr_ram=4GB&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:08.987598677Z ::1 - - [09/Feb/2026:15:40:08 +0000] "GET /api/v1/market/products?category=Deodorants&minPrice=100&maxPrice=250&condition=new&sort=-createdAt&ratingMin=3&etaMaxDays=2&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:08.989611159Z ::1 - - [09/Feb/2026:15:40:08 +0000] "GET /api/v1/market/products?category=Circuit+Breakers&attr_ram=8GB&attr_size=S&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:08.990165893Z ::1 - - [09/Feb/2026:15:40:08 +0000] "GET /api/v1/market/products?category=Monitors+%26+Displays&condition=refurbished&ratingMin=3&discountMin=20&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:09.091995119Z ::1 - - [09/Feb/2026:15:40:09 +0000] "GET /api/v1/market/products?category=Storage+Devices&minPrice=0&maxPrice=20&sort=-price&ratingMin=4.5&etaMaxDays=7&discountMin=10&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:09.092608915Z ::1 - - [09/Feb/2026:15:40:09 +0000] "GET /api/v1/market/products?category=Baby+Snacks&attr_ram=6GB&attr_size=S&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:09.384499159Z ::1 - - [09/Feb/2026:15:40:09 +0000] "GET /api/v1/market/products?category=Baby+Snacks&attr_ram=8GB&attr_size=M&limit=30 HTTP/1.1" 200 77 "-" "node"
2026-02-09T15:40:10.085572157Z ::1 - - [09/Feb/2026:15:40:10 +0000] "GET /api/v1/market/products?category=Cleaning+Tools&minPrice=50&maxPrice=100&condition=refurbished&ratingMin=3&etaMaxDays=7&attr_color=White&limit=30 HTTP/1.1" 200 77 "-" "node"