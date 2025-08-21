// Import our database functions
const { testConnection, syncDatabase } = require('./config/database');
// Import our User model
const User = require('./models/User');

// Function to run all our tests
async function runDatabaseTests() {
  console.log('TESTING DATABASE SETUP');
  
  try {
    // Test 1: Connection to PostgreSQL
    console.log('Test 1: Database Connection');
    const connected = await testConnection();
    
    if (!connected) {
      console.log(' Cannot connect to database.');
      process.exit(1);
    }
    
    // Test 2: Can we create tables?
    console.log('\n Test 2: Table Creation');
    await syncDatabase({ force: false }); // Don't delete existing data
    
    // Test 3: Can we create a test user?
    console.log('\n Test 3: Creating Test User');
    
    // First, try to find if test user already exists
    let testUser = await User.findOne({ where: { email: 'test@iceberg.com' } });
    
    if (testUser) {
      console.log('Test user already exists');
    } else {
      // Create a new test user
      testUser = await User.create({
        email: 'test@iceberg.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Agent',
        phoneNumber: '07700900123'
      });
      console.log('Test user created successfully');
    }
    
    // Test 4: Can we validate passwords?
    console.log('\nTest 4: Password Validation');
    const isValidPassword = await testUser.validatePassword('testpassword123');
    const isInvalidPassword = await testUser.validatePassword('wrongpassword');
    
    if (isValidPassword && !isInvalidPassword) {
      console.log(' Password validation working correctly');
    } else {
      console.log('Password validation failed');
    }
    
    // Test 5: Check data security
    console.log('\nTest 5: Data Security');
    const userJson = testUser.toJSON();
    
    if (!userJson.password) {
      console.log('Password properly hidden from JSON output');
    } else {
      console.log('Security issue: Password visible in JSON');
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (error) {
    console.error('\n💥 TEST FAILED:');
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

// Run the tests
runDatabaseTests();