const bcrypt = require('bcryptjs');

// Function to generate password hash
async function generateHash(password, saltRounds = 10) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    return null;
  }
}

// Function to verify password against hash
async function verifyPassword(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Generate hashes for common passwords
async function generateCommonHashes() {
  const passwords = [
    { name: 'Demo User Password', password: 'demo123' },
    { name: 'Admin Password', password: 'admin123' },
    { name: 'User Test Password', password: 'password123' },
    { name: 'WhiteTag Admin', password: 'whitetag2024' }
  ];

  console.log('🔐 WhiteTag Password Hash Generator\n');
  
  for (const item of passwords) {
    const hash = await generateHash(item.password);
    console.log(`${item.name}:`);
    console.log(`Password: ${item.password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }

  // Test verification
  console.log('\n✅ Testing hash verification:');
  const testHash = await generateHash('demo123');
  const isValid = await verifyPassword('demo123', testHash);
  console.log(`Verification test: ${isValid ? 'PASSED' : 'FAILED'}`);
}

// Run if called directly
if (require.main === module) {
  generateCommonHashes().catch(console.error);
}

module.exports = { generateHash, verifyPassword }; 