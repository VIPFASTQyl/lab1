import jwt from 'jsonwebtoken';
import http from 'http';

// Generate a fresh JWT token
const token = jwt.sign(
  {
    userId: 1,
    name: 'Erijon Gashi',
    email: 'kd70695@ubt-uni.net',
    isAdmin: false
  },
  'change_this_secret_please',
  { expiresIn: '1h' }
);

console.log('🔐 Fresh JWT Token Generated:');
console.log(token);
console.log('');

// Prepare the request payload
const payload = JSON.stringify({
  eventId: 1,
  eventTitle: 'Kultura - Season 5 | Edition 1',
  ticketType: 'Early Bird',
  quantity: 1,
  email: 'kd70695@ubt-uni.net',
  name: 'Erijon Gashi'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/purchases',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length,
    'Authorization': `Bearer ${token}`
  }
};

console.log('📤 Sending ticket purchase request...');
console.log('================================');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response Status:', res.statusCode);
    console.log('');
    console.log('📧 Response:');
    try {
      const parsed = JSON.parse(data);
      if (parsed.tickets && parsed.tickets.length > 0) {
        console.log('Ticket Code:', parsed.tickets[0].ticketCode);
        console.log('Event:', parsed.tickets[0].eventTitle);
        console.log('Type:', parsed.tickets[0].ticketType);
        console.log('');
        console.log('✅ Ticket purchase successful!');
        console.log('');
        console.log('📧 Check your Mailtrap inbox for the confirmation email:');
        console.log('🔗 https://mailtrap.io');
      } else {
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(payload);
req.end();
