# syntax=docker/dockerfile:1

# -------------------------------------------------------------
# Stage 1: Build production frontend bundle
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production runtime server
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server and built static assets from builder
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Healthcheck for container orchestrators (Docker Swarm, Kubernetes, AWS ECS, Cloud Run)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Security: Run as unprivileged node user
USER node

EXPOSE 3000

CMD ["node", "server.js"]
