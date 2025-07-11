const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-single-password.cjs <password>');
  console.log('Example: node scripts/hash-single-password.cjs mypassword123');
  process.exit(1);
}

// Generate hash
bcrypt.hash(password, 10).then(hash => {
  console.log('🔐 Password Hash Generated\n');
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('\n📋 Copy this hash to your Supabase database:');
  console.log(`'${hash}'`);
}).catch(error => {
  console.error('Error generating hash:', error);
  process.exit(1);
}); 