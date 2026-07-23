/**
 * Seed script — intentionally empty.
 *
 * viralNest only stores real extracted content.
 * To populate the database, paste real URLs into the search bar.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.content.count();
  console.log(`📊 Database has ${count} real content items.`);
  console.log('ℹ️  No seed data — viralNest only stores real extracted content.');
  console.log('   Paste real URLs into the search bar to populate the feed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
