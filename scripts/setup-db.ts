import { execSync } from 'child_process';

const DATABASE_URL = 'postgresql://facturia:facturia@127.0.0.1:5432/facturia?schema=public';

process.env.DATABASE_URL = DATABASE_URL;

console.log('Running Prisma db push...');
try {
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  console.log('✓ Database schema created successfully');
} catch (error) {
  console.error('✗ Failed to create database schema');
  process.exit(1);
}
