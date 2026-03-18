#!/bin/bash
# Render deploy startup script.
# Copies the production Prisma schema (PostgreSQL), runs migrations and seeds.
set -e

echo "🔄 Switching to production PostgreSQL schema..."
cp prisma/schema.prod.prisma prisma/schema.prisma

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing schema to database..."
npx prisma db push

echo "🌱 Seeding production data..."
node prisma/seed.prod.js

echo "✅ Deploy complete!"
