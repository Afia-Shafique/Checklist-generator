const pool = require('./db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test users table
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table exists!');
    console.log('Number of users in database:', usersResult.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
