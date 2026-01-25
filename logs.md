aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/products%2F692f645f9159e68e7de37bb5%2F1764713583435_0.JPG?w=400&q=80 404 536.120 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fhard-shell-suitcase-28-inch-1%2F800%2F800?w=400&q=80 404 551.359 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Ftravel-backpack-40l-1%2F800%2F800?w=400&q=80 404 204.694 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fdash-camera-full-hd-1%2F800%2F800?w=400&q=80 404 218.393 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fleather-seat-covers-set-1%2F800%2F800?w=400&q=80 404 204.748 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2F2020-toyota-corolla-1%2F800%2F800?w=400&q=80 404 207.176 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Ftechpad-air-10-1%2F800%2F800?w=400&q=80 404 205.075 ms - 27
@afritrade/api:dev: GET /api/v1/market/products/featured?limit=12 200 54.177 ms - 14754
@afritrade/api:dev: GET /api/v1/market/products?limit=24&discountMin=5 200 82.224 ms - 17943
@afritrade/api:dev: GET /api/v1/market/products?limit=24&sort=-views&brand=Maxmuscle 200 93.345 ms - 1469
@afritrade/api:dev: GET /api/v1/market/categories 200 89.981 ms - 102268
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fpremium-yoga-mat-1%2F800%2F800?w=400&q=80 404 242.726 ms - 27
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fmountain-bike-26-inch-1%2F800%2F800?w=400&q=80 404 268.634 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Froad-bike-28-inch-1%2F800%2F800?w=400&q=80 404 281.603 ms - 27
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: GET /api/v1/market/categories 200 136.368 ms - 102268
@afritrade/api:dev: GET /api/v1/notifications/unread-count 200 122.365 ms - 45
@afritrade/api:dev: GET /api/v1/notifications?limit=20 200 159.366 ms - 1531
@afritrade/api:dev: GET /api/v1/user-preferences 200 117.229 ms - 439
@afritrade/api:dev: Auth middleware received token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U
@afritrade/api:dev: GET /api/v1/notifications/unread-count 200 126.816 ms - 45
@afritrade/api:dev: GET /api/v1/user-preferences 200 23.982 ms - 439
@afritrade/api:dev: GET /api/v1/notifications?limit=20 200 137.236 ms - 1531
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Faero-studio-headphones-1%2F800%2F800?w=400&q=80 404 212.498 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Faurora-max-1%2F800%2F800?w=400&q=80 404 205.357 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fhard-shell-suitcase-20-inch-1%2F800%2F800?w=400&q=80 404 197.540 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Fnova-x1-pro-1%2F800%2F800?w=400&q=80 404 214.456 ms - 27
@afritrade/api:dev: Image optimization error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: Image controller error: NoSuchKey: The specified key does not exist.
@afritrade/api:dev:     at AwsRestXmlProtocol.handleError (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js:1834:27)
@afritrade/api:dev:     at processTicksAndRejections (node:internal/process/task_queues:95:5)
@afritrade/api:dev:     at async AwsRestXmlProtocol.deserializeResponse (/Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js:309:13)
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js:26:24
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:386:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@smithy/middleware-retry/dist-cjs/index.js:254:46
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:63:28
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:90:20
@afritrade/api:dev:     at async /Users/harz/Documents/backUps/glotrade_ecom/node_modules/@aws-sdk/client-s3/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:5:26
@afritrade/api:dev:     at async ImageService.optimizeImage (/Users/harz/Documents/backUps/glotrade_ecom/apps/api/src/services/ImageService.ts:40:30) {
@afritrade/api:dev:   '$fault': 'client',
@afritrade/api:dev:   '$retryable': undefined,
@afritrade/api:dev:   '$metadata': {
@afritrade/api:dev:     httpStatusCode: 404,
@afritrade/api:dev:     requestId: undefined,
@afritrade/api:dev:     extendedRequestId: undefined,
@afritrade/api:dev:     cfId: undefined,
@afritrade/api:dev:     attempts: 1,
@afritrade/api:dev:     totalRetryDelay: 0
@afritrade/api:dev:   },
@afritrade/api:dev:   Code: 'NoSuchKey'
@afritrade/api:dev: }
@afritrade/api:dev: GET /api/v1/images/seed%2Ftechpad-mini-8-1%2F800%2F800?w=400&q=80 404 212.713 ms - 27
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 5.331 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 6.265 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 7.621 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 8.110 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 7.861 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 5.945 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 5.076 ms - -
@afritrade/api:dev: GET /api/v1/realtime/notifications/stream?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDA4NjljYzkyMjc1ODFhOWZmNjdkYSIsImVtYWlsIjoiZGlzdDEwX25nQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZGlzdDEwX25nIiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzY5MzM3ODk1LCJleHAiOjE3Njk5NDI2OTV9.FVPOnT_nl55_BFVSb4cyoIaMW_7ErLT4df9PFGeT56U 200 7.400 ms - -
