const axios = require('axios');

async function testJoinEndpoint() {
  try {
    console.log('🧪 Testing join endpoint...');
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:4000/auth/login', {
      email: 'player2@demo.com',
      password: 'Player123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Create a share code first (as player@demo.com)
    const creatorLoginResponse = await axios.post('http://localhost:4000/auth/login', {
      email: 'player@demo.com',
      password: 'Player123'
    });
    
    const creatorToken = creatorLoginResponse.data.token;
    console.log('✅ Creator login successful');
    
    // Create share code
    const shareResponse = await axios.post('http://localhost:4000/api/share/create', {}, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    
    const shareCode = shareResponse.data.data.gameShare.code;
    console.log('✅ Share code created:', shareCode);
    
    // Now test the join endpoint
    console.log('🔍 Testing join with code:', shareCode);
    const joinResponse = await axios.post('http://localhost:4000/api/share/join', {
      code: shareCode
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Join successful!');
    console.log('📊 Response:', JSON.stringify(joinResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Wait a bit for server to start
setTimeout(testJoinEndpoint, 3000);
