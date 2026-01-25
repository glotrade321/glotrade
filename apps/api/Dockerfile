# Backend Dockerfile for Monorepo
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package.json yarn.lock* ./

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY apps/api ./apps/api

# Build TypeScript
WORKDIR /app/apps/api
RUN yarn build:prod

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./package.json

# Copy node_modules from both root and apps/api
COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=apiuser:nodejs /app/apps/api/node_modules ./apps_api_modules

# Create directories that the app needs to write to
RUN mkdir -p /app/public/invoices && chown -R apiuser:nodejs /app/public

USER apiuser

EXPOSE 5000

ENV PORT=5000

CMD ["node", "dist/app.js"]

