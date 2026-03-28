# ============================================
# Restaurant OS - Real-time Service Dockerfile
# Production-ready WebSocket server
# ============================================

FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun build index.ts --compile --outfile=index.js

# Production stage
FROM base AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --gid 1001 realtime

# Copy built files
COPY --from=builder /app/index.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set ownership
RUN chown -R realtime:nodejs /app

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Switch to non-root user
USER realtime

# Start the service
CMD ["bun", "index.js"]
