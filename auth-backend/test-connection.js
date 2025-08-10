require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...\n');

// Log the DATABASE_URL (without password for security)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const urlParts = dbUrl.split('@');
  if (urlParts.length > 1) {
    console.log('📋 Database URL format:', urlParts[0].split('://')[0] + '://***:***@' + urlParts[1]);
  }
} else {
  console.log('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  
  // Provide specific help for common errors
  if (err.message.includes('SASL')) {
    console.log('\n🔧 SASL Error Solutions:');
    console.log('1. Check if your password contains special characters');
    console.log('2. URL encode special characters in your password:');
    console.log('   - @ becomes %40');
    console.log('   - # becomes %23');
    console.log('   - $ becomes %24');
    console.log('   - & becomes %26');
    console.log('   - + becomes %2B');
    console.log('   - / becomes %2F');
    console.log('   - : becomes %3A');
    console.log('   - = becomes %3D');
    console.log('   - ? becomes %3F');
    console.log('   - space becomes %20');
    console.log('\n3. Example: If password is "my@password", use "my%40password"');
  }
  
  if (err.message.includes('ECONNREFUSED')) {
    console.log('\n🔧 Connection Refused Solutions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check if PostgreSQL is listening on port 5432');
    console.log('3. Verify the host and port in your DATABASE_URL');
  }
  
  if (err.message.includes('authentication failed')) {
    console.log('\n🔧 Authentication Failed Solutions:');
    console.log('1. Verify username and password are correct');
    console.log('2. Check if the user has access to the database');
    console.log('3. Ensure the database exists');
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    console.log('\n🎉 All tests passed! Database is working correctly.');
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
