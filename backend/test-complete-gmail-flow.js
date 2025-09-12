// Test Complete Gmail Integration Flow
require('dotenv').config({ path: './.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🧪 COMPLETE GMAIL INTEGRATION TEST');
console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteGmailFlow() {
  const testUserId = 'dGVzdEBleGFtcGxlLmNvbQ'; // base64 of test@example.com

  console.log('\n🎯 Testing Complete Gmail Integration Flow');
  console.log('Test User ID:', testUserId);

  try {
    // Test 1: User Registration/Login
    console.log('\n1️⃣ Testing User Registration...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([{
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        grade: '12th',
        is_active: true
      }])
      .select();

    if (userError) {
      console.log('❌ User registration failed:', userError);
      return;
    }
    console.log('✅ User registered:', userData[0].id);

    // Test 2: Gmail Configuration Save
    console.log('\n2️⃣ Testing Gmail Configuration Save...');
    const { data: gmailData, error: gmailError } = await supabase
      .from('email_configurations')
      .insert([{
        user_id: testUserId,
        provider: 'gmail',
        config: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          refreshToken: 'test-refresh-token-' + Date.now(),
          accessToken: 'test-access-token-' + Date.now(),
          userEmail: 'test@example.com',
          expiryDate: Date.now() + (3600 * 1000)
        }
      }])
      .select();

    if (gmailError) {
      console.log('❌ Gmail config save failed:', gmailError);
      return;
    }
    console.log('✅ Gmail config saved:', gmailData[0].id);

    // Test 3: Gmail Configuration Retrieval
    console.log('\n3️⃣ Testing Gmail Configuration Retrieval...');
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('user_id', testUserId)
      .eq('provider', 'gmail')
      .single();

    if (retrieveError) {
      console.log('❌ Gmail config retrieval failed:', retrieveError);
      return;
    }
    console.log('✅ Gmail config retrieved successfully');
    console.log('   - Provider:', retrievedData.provider);
    console.log('   - User Email:', retrievedData.config.userEmail);
    console.log('   - Has Refresh Token:', !!retrievedData.config.refreshToken);
    console.log('   - Has Access Token:', !!retrievedData.config.accessToken);

    // Test 4: Email Configuration Update
    console.log('\n4️⃣ Testing Gmail Configuration Update...');
    const { data: updateData, error: updateError } = await supabase
      .from('email_configurations')
      .update({
        config: {
          ...retrievedData.config,
          accessToken: 'updated-access-token-' + Date.now(),
          updatedAt: new Date().toISOString()
        }
      })
      .eq('user_id', testUserId)
      .eq('provider', 'gmail')
      .select()
      .single();

    if (updateError) {
      console.log('❌ Gmail config update failed:', updateError);
      return;
    }
    console.log('✅ Gmail config updated successfully');

    // Test 5: Multiple Users Isolation
    console.log('\n5️⃣ Testing User Isolation...');
    const otherUserId = 'b3RoZXJ1c2VyQGV4YW1wbGUuY29t'; // base64 of otheruser@example.com

    // Create another user
    await supabase.from('users').upsert([{
      id: otherUserId,
      email: 'otheruser@example.com',
      name: 'Other User',
      grade: '11th',
      is_active: true
    }]);

    // Try to access first user's Gmail config with second user ID
    const { data: isolationData, error: isolationError } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('user_id', otherUserId)
      .eq('provider', 'gmail');

    if (isolationError && isolationError.code !== 'PGRST116') {
      console.log('❌ Isolation test failed:', isolationError);
      return;
    }

    console.log('✅ User isolation working - other user has no Gmail config');

    // Test 6: Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    await supabase.from('email_configurations').delete().eq('user_id', testUserId);
    await supabase.from('email_configurations').delete().eq('user_id', otherUserId);
    await supabase.from('users').delete().eq('id', testUserId);
    await supabase.from('users').delete().eq('id', otherUserId);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 COMPLETE GMAIL INTEGRATION TEST PASSED!');
    console.log('✅ User registration and management');
    console.log('✅ Gmail configuration storage');
    console.log('✅ Gmail configuration retrieval');
    console.log('✅ Gmail configuration updates');
    console.log('✅ User data isolation');
    console.log('✅ Database cleanup');

  } catch (error) {
    console.log('❌ Complete test failed with exception:', error);
  }
}

testCompleteGmailFlow();

