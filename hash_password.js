// hash_password.js
const bcrypt = require('bcrypt');

async function run() {
  const plain = 'smiths123ABC$'; // marker's password
  const hash = await bcrypt.hash(plain, 10);
  console.log('Plain password:', plain);
  console.log('Generated bcrypt hash:\n', hash);
}

run().catch(console.error);
