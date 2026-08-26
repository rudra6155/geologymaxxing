import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

// We need a Service Role key to create the test accounts and bypass RLS to set things up
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runTests() {
  if (!SERVICE_ROLE_KEY) {
    console.error('ERROR: Cannot run RLS tests without a SUPABASE_SERVICE_ROLE_KEY and real project credentials.');
    console.error('Current URL:', SUPABASE_URL);
    process.exit(1);
  }

  console.log('--- Starting RLS Concrete Tests ---');
  
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  // 1. Create two test accounts
  console.log('1. Creating test accounts User A and User B...');
  const userAEmail = `test_a_${Date.now()}@example.com`;
  const userBEmail = `test_b_${Date.now()}@example.com`;
  const password = 'testpassword123';
  
  const { data: dataA, error: errA } = await adminClient.auth.admin.createUser({ email: userAEmail, password, email_confirm: true });
  const { data: dataB, error: errB } = await adminClient.auth.admin.createUser({ email: userBEmail, password, email_confirm: true });
  
  if (errA || errB) {
    console.error('Failed to create users:', errA, errB);
    return;
  }
  
  const userA = dataA.user;
  const userB = dataB.user;
  console.log(`✓ User A created: ${userA.id}`);
  console.log(`✓ User B created: ${userB.id}`);
  
  // Create profile for B and insert some dummy data for B using admin client (bypasses RLS)
  const { error: insErr1 } = await adminClient.from('profiles').insert({ id: userB.id, display_name: 'User B', std: 12 });
  const { error: insErr2 } = await adminClient.from('topic_progress').insert({ user_id: userB.id, topic_id: 'topic_xyz', status: 'completed' });
  const { error: insErr3 } = await adminClient.from('question_attempts').insert({ user_id: userB.id, question_id: 'q1', topic_id: 'topic_xyz', is_correct: true });
  const { error: insErr4 } = await adminClient.from('gauntlet_runs').insert({ user_id: userB.id, topic_id: 'topic_xyz', started_at: new Date().toISOString(), ended_at: new Date().toISOString(), result: 'cleared', max_streak: 5 });
  
  if (insErr1 || insErr2 || insErr3 || insErr4) {
    console.error('Error inserting dummy data:', insErr1, insErr2, insErr3, insErr4);
  } else {
    console.log('✓ Inserted dummy data for User B.');
  }

  // 2. Log in as User A using standard Anon client
  console.log('\n2. Logging in as User A...');
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await clientA.auth.signInWithPassword({ email: userAEmail, password });
  console.log('✓ Logged in as User A.');

  // 3. Attempt to SELECT User B's rows directly
  console.log('\n3. User A attempting to SELECT User B\'s rows...');
  
  const { data: selectProfile, error: errProfile } = await clientA.from('profiles').select('*').eq('id', userB.id);
  const { data: selectProgress, error: errProgress } = await clientA.from('topic_progress').select('*').eq('user_id', userB.id);
  const { data: selectAttempts, error: errAttempts } = await clientA.from('question_attempts').select('*').eq('user_id', userB.id);
  const { data: selectGauntlet, error: errGauntlet } = await clientA.from('gauntlet_runs').select('*').eq('user_id', userB.id);

  console.log('Result of selecting profiles:', selectProfile, 'Error:', errProfile?.message || 'none');
  console.log('Result of selecting topic_progress:', selectProgress, 'Error:', errProgress?.message || 'none');
  console.log('Result of selecting question_attempts:', selectAttempts, 'Error:', errAttempts?.message || 'none');
  console.log('Result of selecting gauntlet_runs:', selectGauntlet, 'Error:', errGauntlet?.message || 'none');
  
  if (Array.isArray(selectProfile) && selectProfile.length === 0 && 
      Array.isArray(selectProgress) && selectProgress.length === 0 && 
      Array.isArray(selectAttempts) && selectAttempts.length === 0 && 
      Array.isArray(selectGauntlet) && selectGauntlet.length === 0) {
    console.log('✓ SUCCESS: All SELECTs returned empty arrays (RLS enforced).');
  } else {
    console.error('❌ FAIL: User A was able to read User B\'s data or an error occurred!');
  }

  // 4. Attempt to INSERT/UPDATE User B's row
  console.log('\n4. User A attempting to INSERT/UPDATE data for User B...');
  
  const { error: insertError } = await clientA.from('topic_progress').insert({
    user_id: userB.id,
    topic_id: 'topic_abc',
    status: 'in_progress'
  });
  console.log('Result of INSERTing into topic_progress as User B:', insertError ? `Rejected: ${insertError.message}` : 'Inserted successfully');
  
  const { error: insertAttemptError } = await clientA.from('question_attempts').insert({
    user_id: userB.id,
    question_id: 'malicious_q',
    topic_id: 'topic_abc',
    is_correct: false
  });
  console.log('Result of INSERTing into question_attempts as User B:', insertAttemptError ? `Rejected: ${insertAttemptError.message}` : 'Inserted successfully');

  const { error: insertGauntletError } = await clientA.from('gauntlet_runs').insert({
    user_id: userB.id,
    topic_id: 'topic_abc',
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    result: 'cleared',
    max_streak: 99
  });
  console.log('Result of INSERTing into gauntlet_runs as User B:', insertGauntletError ? `Rejected: ${insertGauntletError.message}` : 'Inserted successfully');

  // UPDATE tests
  const { error: updateError, data: updateData, count: updateCount } = await clientA.from('profiles').update({ display_name: 'Hacked by A' }).eq('id', userB.id).select();
  console.log('Result of UPDATEing profiles as User B:', updateError ? `Rejected: ${updateError.message}` : `Success with 0 error. Rows actually updated: ${updateData?.length}`);
  
  const { error: updateAttemptError, data: updateAttemptData } = await clientA.from('question_attempts').update({ is_correct: true }).eq('user_id', userB.id).select();
  console.log('Result of UPDATEing question_attempts as User B:', updateAttemptError ? `Rejected: ${updateAttemptError.message}` : `Success with 0 error. Rows actually updated: ${updateAttemptData?.length}`);

  const { error: updateGauntletError, data: updateGauntletData } = await clientA.from('gauntlet_runs').update({ max_streak: 999 }).eq('user_id', userB.id).select();
  console.log('Result of UPDATEing gauntlet_runs as User B:', updateGauntletError ? `Rejected: ${updateGauntletError.message}` : `Success with 0 error. Rows actually updated: ${updateGauntletData?.length}`);

  const { data: finalProfileCheck } = await adminClient.from('profiles').select('display_name').eq('id', userB.id).single();
  const { data: finalAttemptCheck } = await adminClient.from('question_attempts').select('is_correct').eq('user_id', userB.id).single();
  const { data: finalGauntletCheck } = await adminClient.from('gauntlet_runs').select('max_streak').eq('user_id', userB.id).single();
  
  console.log(`Did the data actually change?`);
  console.log(` - Profile display_name: "${finalProfileCheck?.display_name}" (Expected: "User B")`);
  console.log(` - Question attempt is_correct: ${finalAttemptCheck?.is_correct} (Expected: true)`);
  console.log(` - Gauntlet max_streak: ${finalGauntletCheck?.max_streak} (Expected: 5)`);
  
  if (finalProfileCheck?.display_name !== 'User B' || finalAttemptCheck?.is_correct !== true || finalGauntletCheck?.max_streak !== 5) {
     console.error('❌ FAIL: User A bypassed RLS and modified User B!');
  } else {
     console.log('✓ SUCCESS: RLS prevented all updates (0 rows affected).');
  }

  // Cleanup
  console.log('\nCleaning up test accounts...');
  await adminClient.auth.admin.deleteUser(userA.id);
  await adminClient.auth.admin.deleteUser(userB.id);
  console.log('✓ Cleanup complete.');
}

runTests().catch(console.error);
