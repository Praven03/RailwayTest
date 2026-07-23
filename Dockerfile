# syntax=docker/dockerfile:1

# ---------- Stage 1: install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Stage 2: build the app ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Uses the "standalone" output configured in next.config.ts —
# produces a minimal server bundle with only the files it needs.
RUN npm run build

# ---------- Stage 3: run the app ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as a non-root user (good practice for any container facing the internet)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone build output includes a minimal server.js + only the
# node_modules it actually needs — much smaller than copying everything.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# This is where the local JSON data store lives — mount a volume here
# (see docker-compose.yml) so report data survives container restarts.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
