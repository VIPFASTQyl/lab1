import jwt from 'jsonwebtoken';

// Generate a test JWT token
const token = jwt.sign(
  {
    userId: 1,
    name: 'Erijon Gashi',
    email: 'kd70695@ubt-uni.net',
    isAdmin: false
  },
  'super_secret_key_change_me',
  { expiresIn: '1h' }
);

console.log('Test JWT Token:');
console.log(token);
console.log('\n✅ Use this token in your curl request:\n');
console.log('curl -X POST http://localhost:5000/api/purchases \\');
console.log('  -H "Content-Type: application/json" \\');
console.log(`  -H "Authorization: Bearer ${token}" \\`);
console.log('  -d \'{');
console.log('    "eventId": 1,');
console.log('    "eventTitle": "Kultura - Season 5 | Edition 1",');
console.log('    "ticketType": "Early Bird",');
console.log('    "quantity": 1,');
console.log('    "email": "kd70695@ubt-uni.net",');
console.log('    "name": "Erijon Gashi"');
console.log('  }\'');
