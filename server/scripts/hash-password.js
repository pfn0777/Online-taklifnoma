// Usage: node scripts/hash-password.js "your password"  -> paste output into ADMIN_PASSWORD_HASH
const { hashPassword } = require('../lib/auth');

const MIN_PASSWORD_LEN = 10;
const password = process.argv[2];

if (!password || password.length < MIN_PASSWORD_LEN) {
  console.error('Usage: node scripts/hash-password.js "<password of at least ' + MIN_PASSWORD_LEN + ' chars>"');
  process.exit(1);
}

console.log(hashPassword(password));
