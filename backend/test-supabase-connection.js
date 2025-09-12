// Test Supabase connection directly
require('dotenv').config({ path: './.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Supabase Connection Test');
console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing connection to users table...');

    // Test 1: Simple count query
    const { data: countData, error: countError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    console.log('Count query result:', { data: countData, error: countError });

    if (countError) {
      console.log('❌ Count query failed:', countError);
      console.log('Error code:', countError.code);
      console.log('Error message:', countError.message);

      // Check if it's an RLS issue
      if (countError.code === 'PGRST301' || countError.message.includes('permission')) {
        console.log('⚠️  This appears to be an RLS (Row Level Security) permission issue');
        console.log('🔄 Try updating your RLS policies in Supabase');
      }
    } else {
      console.log('✅ Count query successful');
    }

    // Test 2: Create a test user first
    console.log('\n🔍 Creating test user...');
    const testUserId = 'am9lbGtvbW1vamlAZ21haWwuY29t'; // base64 encoded email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([{
        id: testUserId,
        email: 'joelkommoji@gmail.com',
        name: 'Test User',
        grade: '12th',
        is_active: true
      }])
      .select();

    console.log('User creation result:', { data: userData, error: userError });

    if (userError) {
      console.log('❌ User creation failed:', userError);
    } else {
      console.log('✅ User created successfully');
    }

    // Test 3: Now try to insert Gmail config
    console.log('\n🔍 Testing Gmail config insert operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('email_configurations')
      .insert([{
        user_id: testUserId,
        provider: 'gmail',
        config: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          refreshToken: 'test-refresh-token',
          accessToken: 'test-access-token',
          userEmail: 'joelkommoji@gmail.com',
          expiryDate: Date.now() + (3600 * 1000)
        }
      }])
      .select();

    console.log('Gmail config insert result:', { data: insertData, error: insertError });

    if (insertError) {
      console.log('❌ Gmail config insert failed:', insertError);
      console.log('Error code:', insertError.code);
      console.log('Error message:', insertError.message);
    } else {
      console.log('✅ Gmail config insert successful');
    }

    // Test 4: Try to select from email_configurations
    console.log('\n🔍 Testing select from email_configurations...');
    const { data: selectData, error: selectError } = await supabase
      .from('email_configurations')
      .select('*')
      .limit(5);

    console.log('Select result:', { data: selectData, error: selectError });

    if (selectError) {
      console.log('❌ Select failed:', selectError);
      console.log('Error code:', selectError.code);
      console.log('Error message:', selectError.message);
    } else {
      console.log('✅ Select successful');
      console.log('Records found:', selectData.length);
    }

  } catch (error) {
    console.log('❌ Connection test failed with exception:', error);
  }
}

testConnection();
