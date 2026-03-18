# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Install OpenSSL (Debian slim has OpenSSL 3 via apt)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy production schema (PostgreSQL) and generate Prisma client
COPY prisma/ ./prisma/
RUN cp prisma/schema.prod.prisma prisma/schema.prisma && npx prisma generate

# Copy rest of source
COPY src/ ./src/

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/index.js"]
