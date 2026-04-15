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

console.log('🎫 TICKET PURCHASE TEST');
console.log('='.repeat(60));
console.log('');

// Prepare the request payload
const payload = JSON.stringify({
  eventId: 1,
  eventTitle: 'Kultura - Season 5 | Edition 1',
  ticketType: 'Early Bird',
  quantity: 2,
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

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}\n`);
    
    try {
      const response = JSON.parse(data);
      
      console.log(`📧 Purchase ID: ${response.purchaseId}`);
      console.log(`👤 Name: ${response.purchaserName}`);
      console.log(`📧 Email: ${response.purchaserEmail}`);
      console.log(`🎪 Event: ${response.eventTitle}`);
      console.log(`🎫 Tickets: ${response.ticketCount}`);
      console.log('');
      console.log('🎟️ TICKET DETAILS:');
      console.log('='.repeat(60));
      
      response.tickets.forEach((ticket, idx) => {
        console.log(`\n📋 Ticket ${ticket.ticketNumber}:`);
        console.log(`   Code: ${ticket.ticketCode}`);
        console.log(`   Type: ${ticket.ticketType}`);
        console.log(`   Purchased: ${new Date(ticket.purchasedAt).toLocaleString()}`);
        console.log(`\n   QR Code (Base64 - First 100 chars):`);
        console.log(`   ${ticket.qrCode.substring(0, 100)}...`);
        console.log(`\n   📝 Instructions:`);
        ticket.instructions.forEach(inst => console.log(`      ${inst}`));
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('📋 NEXT STEPS:');
      console.log(`   1️⃣  ${response.nextSteps.step1}`);
      console.log(`   2️⃣  ${response.nextSteps.step2}`);
      console.log(`   3️⃣  ${response.nextSteps.step3}`);
      console.log(`\n✨ ${response.nextSteps.dashboard}`);
      console.log('');
      console.log('✅ Test completed successfully!');
      console.log('🎉 Tickets are ready to use!');
      
    } catch (e) {
      console.log('Response (Raw):');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(payload);
req.end();
