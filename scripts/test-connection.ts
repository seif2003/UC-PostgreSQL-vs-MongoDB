import { Client } from 'pg';

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'facturia',
  user: 'facturia',
  password: 'facturia',
  ssl: false
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✓ Connected successfully!');
    
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log('Current user:', result.rows[0].current_user);
    console.log('Current database:', result.rows[0].current_database);
    console.log('PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    await client.end();
  } catch (error: any) {
    console.error('✗ Connection failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testConnection();
