const fetch = globalThis.fetch;

async function run() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ticketapp.com', password: 'admin123' })
    });

    console.log('Login status:', loginRes.status);
    const loginBody = await loginRes.text();
    console.log('Login body:', loginBody);

    if (loginRes.status !== 200) return;

    const { token } = JSON.parse(loginBody);
    console.log('Token length:', token ? token.length : 0);

    const createRes = await fetch('http://localhost:5000/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ name: 'auto-test-partner', description: 'Created by api-test' })
    });

    console.log('Create partner status:', createRes.status);
    console.log('Create partner body:', await createRes.text());

    const listRes = await fetch('http://localhost:5000/api/partners');
    console.log('List partners status:', listRes.status);
    console.log('List partners body:', await listRes.text());
  } catch (err) {
    console.error('Error in api-test:', err);
  }
}

run();
