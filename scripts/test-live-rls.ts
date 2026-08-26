import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log('--- Starting Live Quiz Adversarial RLS Tests ---\n');

  // 1. Setup a dummy session via Admin
  console.log('1. Setting up a dummy live session...');
  
  // Create an arbitrary UUID for host_token
  const validHostToken = '11111111-1111-1111-1111-111111111111';
  const wrongHostToken = '22222222-2222-2222-2222-222222222222';
  
  // Use anonClient to create a session (since anyone can create one)
  const { data: sessionData, error: sessionErr } = await anonClient.rpc('create_live_session', {
    p_room_code: 'TEST',
    p_chapter_slug: 'structural-geology',
    p_topic_id: 'topic-1'
  });
  
  if (sessionErr) throw sessionErr;
  const session = sessionData;
  console.log(`✓ Session created: ${session.id} (Room: ${session.room_code})`);

  // 2. Setup Participants
  console.log('\n2. Joining participants...');
  
  const { data: partAData, error: joinErrA } = await anonClient.rpc('join_live_session', {
    p_room_code: 'TEST',
    p_display_name: 'Alice'
  });
  if (joinErrA) throw joinErrA;
  const participantA = partAData;

  const { data: partBData, error: joinErrB } = await anonClient.rpc('join_live_session', {
    p_room_code: 'TEST',
    p_display_name: 'Bob'
  });
  if (joinErrB) throw joinErrB;
  const participantB = partBData;
  
  console.log(`✓ Participant A joined: ${participantA.id}`);
  console.log(`✓ Participant B joined: ${participantB.id}`);

  // --- ADVERSARIAL TESTS ---
  console.log('\n--- BEGIN ATTACKS ---\n');

  // Attack 1: Attempt to advance session with wrong host_token
  console.log('Attack 1: Malicious user attempting to advance session with wrong host_token');
  const { error: advErr1 } = await anonClient.rpc('advance_live_session', {
    p_session_id: session.id,
    p_host_token: wrongHostToken,
    p_new_index: 2,
    p_status: 'active'
  });
  console.log('Result:', advErr1 ? `Rejected: ${advErr1.message}` : '❌ FAIL: Allowed');

  // Attack 2: Attempt to remove participant with wrong host_token
  console.log('\nAttack 2: Malicious user attempting to kick Alice with wrong host_token');
  const { error: kickErr1 } = await anonClient.rpc('remove_participant', {
    p_session_id: session.id,
    p_host_token: wrongHostToken,
    p_participant_id: participantA.id
  });
  console.log('Result:', kickErr1 ? `Rejected: ${kickErr1.message}` : '❌ FAIL: Allowed');

  // Attack 3: Direct SELECT on session_answers
  console.log('\nAttack 3: Malicious user directly SELECTing session_answers via API');
  // First, let's have Alice submit a real answer securely
  await anonClient.rpc('submit_live_answer', {
    p_session_id: session.id,
    p_participant_id: participantA.id,
    p_participant_token: participantA.participant_token,
    p_question_id: 'q1',
    p_selected_answer: 'opt1',
    p_is_correct: true
  });
  
  const { data: selectAns, error: selectAnsErr } = await anonClient.from('session_answers').select('*');
  console.log('Result of SELECT * FROM session_answers:', selectAnsErr ? `Error: ${selectAnsErr.message}` : `Rows returned: ${selectAns?.length}`);
  
  // Attack 4: Direct INSERT into session_answers
  console.log('\nAttack 4: Malicious user directly INSERTing into session_answers bypassing RPC');
  const { error: insertAnsErr } = await anonClient.from('session_answers').insert({
    session_id: session.id,
    participant_id: participantA.id,
    question_id: 'q2',
    selected_answer: 'opt2',
    is_correct: false
  });
  console.log('Result of INSERT INTO session_answers:', insertAnsErr ? `Rejected: ${insertAnsErr.message}` : '❌ FAIL: Allowed');

  // Attack 5: Submit answer using another user's participant_id but wrong token
  console.log('\nAttack 5: Bob attempting to submit answer as Alice using mismatched participant_token');
  const { error: submitErr } = await anonClient.rpc('submit_live_answer', {
    p_session_id: session.id,
    p_participant_id: participantA.id,       // Targeted user
    p_participant_token: participantB.participant_token, // Bob's token
    p_question_id: 'q3',
    p_selected_answer: 'opt3',
    p_is_correct: false
  });
  console.log('Result:', submitErr ? `Rejected: ${submitErr.message}` : '❌ FAIL: Allowed');

  // Cleanup
  console.log('\nCleaning up...');
  await adminClient.from('live_sessions').delete().eq('id', session.id);
  console.log('✓ Cleanup complete.');
}

runTests().catch(console.error);
