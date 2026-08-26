-- Chunk 3: Live Classroom Quiz Schema & RPCs

-- 1. Create tables
create table public.live_sessions (
  id uuid default gen_random_uuid() primary key,
  room_code text not null unique,
  chapter_slug text not null,
  topic_id text not null,
  host_id uuid references auth.users on delete set null,
  status text not null check (status in ('waiting', 'active', 'ended')) default 'waiting',
  current_question_index int not null default -1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secret host tokens stored separately to completely prevent leakage via SELECT *
create table public.live_session_hosts (
  session_id uuid primary key references public.live_sessions on delete cascade,
  host_token uuid not null default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.session_participants (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.live_sessions on delete cascade not null,
  display_name text not null,
  user_id uuid references auth.users on delete set null,
  score int not null default 0,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (session_id, display_name) -- prevent duplicate names in same room
);

-- Secret participant tokens stored separately to completely prevent leakage via SELECT *
create table public.session_participant_tokens (
  participant_id uuid primary key references public.session_participants on delete cascade,
  participant_token uuid not null default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.session_answers (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.live_sessions on delete cascade not null,
  participant_id uuid references public.session_participants on delete cascade not null,
  question_id text not null,
  selected_answer text not null,
  is_correct boolean not null,
  answered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (participant_id, question_id)
);

-- 2. Enable Realtime for session syncing
alter publication supabase_realtime add table public.live_sessions;
alter publication supabase_realtime add table public.session_participants;

-- 3. Enable RLS on all tables
alter table public.live_sessions enable row level security;
alter table public.live_session_hosts enable row level security;
alter table public.session_participants enable row level security;
alter table public.session_participant_tokens enable row level security;
alter table public.session_answers enable row level security;

-- 4. RLS Policies

-- Live sessions: Scoped to active or recent sessions (< 12 hours)
create policy "View active or recent live sessions" 
  on public.live_sessions for select 
  using (
    status in ('waiting', 'active', 'ended')
    and created_at >= (now() - interval '12 hours')
  );

-- Session participants: Scoped strictly to participants of active or recent sessions
create policy "View participants of active or recent sessions" 
  on public.session_participants for select 
  using (
    exists (
      select 1 from public.live_sessions s
      where s.id = session_participants.session_id
        and s.status in ('waiting', 'active', 'ended')
        and s.created_at >= (now() - interval '12 hours')
    )
  );

-- Session answers: Only the logged-in user can read their own answers natively.
-- Anonymous users fetch their answers via a specialized RPC using their participant_token.
create policy "Users can view own live answers" 
  on public.session_answers for select 
  using ( 
    auth.uid() = (select user_id from public.session_participants where id = participant_id)
  );

-- Secret tables (live_session_hosts and session_participant_tokens) have NO SELECT policies,
-- completely blocking any direct client read access.

-- Grant base select permissions
grant select on public.live_sessions to authenticated, anon;
grant select on public.session_participants to authenticated, anon;
grant select on public.session_answers to authenticated, anon;

-- 5. RPC Functions (Security Definer with pinned search_path)

-- Create a session
create or replace function public.create_live_session(
  p_room_code text,
  p_chapter_slug text,
  p_topic_id text
) returns json
language plpgsql security definer set search_path = ''
as $$
declare
  v_session public.live_sessions;
  v_host_token uuid;
begin
  insert into public.live_sessions (room_code, chapter_slug, topic_id, host_id)
  values (upper(p_room_code), p_chapter_slug, p_topic_id, auth.uid())
  returning * into v_session;

  insert into public.live_session_hosts (session_id)
  values (v_session.id)
  returning host_token into v_host_token;
  
  return json_build_object(
    'id', v_session.id,
    'room_code', v_session.room_code,
    'chapter_slug', v_session.chapter_slug,
    'topic_id', v_session.topic_id,
    'host_id', v_session.host_id,
    'status', v_session.status,
    'current_question_index', v_session.current_question_index,
    'created_at', v_session.created_at,
    'host_token', v_host_token
  );
end;
$$;

-- Join a session
create or replace function public.join_live_session(
  p_room_code text,
  p_display_name text
) returns json
language plpgsql security definer set search_path = ''
as $$
declare
  v_session_id uuid;
  v_participant public.session_participants;
  v_participant_token uuid;
begin
  select id into v_session_id from public.live_sessions 
  where room_code = upper(p_room_code) and status = 'waiting';
  
  if v_session_id is null then
    raise exception 'Room not found or no longer accepting players';
  end if;

  insert into public.session_participants (session_id, display_name, user_id)
  values (v_session_id, p_display_name, auth.uid())
  returning * into v_participant;

  insert into public.session_participant_tokens (participant_id)
  values (v_participant.id)
  returning participant_token into v_participant_token;
  
  return json_build_object(
    'id', v_participant.id,
    'session_id', v_participant.session_id,
    'display_name', v_participant.display_name,
    'user_id', v_participant.user_id,
    'score', v_participant.score,
    'joined_at', v_participant.joined_at,
    'participant_token', v_participant_token
  );
end;
$$;

-- Advance session
create or replace function public.advance_live_session(
  p_session_id uuid,
  p_host_token uuid,
  p_new_index int,
  p_status text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.live_session_hosts 
    where session_id = p_session_id and host_token = p_host_token
  ) and not exists (
    select 1 from public.live_sessions 
    where id = p_session_id and host_id = auth.uid()
  ) then
    raise exception 'Unauthorized or session not found';
  end if;

  update public.live_sessions
  set current_question_index = p_new_index, status = p_status
  where id = p_session_id;
end;
$$;

-- Remove participant
create or replace function public.remove_participant(
  p_session_id uuid,
  p_host_token uuid,
  p_participant_id uuid
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  -- Validate host
  if not exists (
    select 1 from public.live_session_hosts 
    where session_id = p_session_id and host_token = p_host_token
  ) and not exists (
    select 1 from public.live_sessions 
    where id = p_session_id and host_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  delete from public.session_participants 
  where id = p_participant_id and session_id = p_session_id;
end;
$$;

-- Submit answer
create or replace function public.submit_live_answer(
  p_session_id uuid,
  p_participant_id uuid,
  p_participant_token uuid,
  p_question_id text,
  p_selected_answer text,
  p_is_correct boolean
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- Validate participant token
  select p.user_id into v_user_id 
  from public.session_participants p
  join public.session_participant_tokens t on p.id = t.participant_id
  where p.id = p_participant_id 
    and t.participant_token = p_participant_token
    and p.session_id = p_session_id;

  if not found then
    raise exception 'Unauthorized participant';
  end if;

  -- Insert into session_answers
  insert into public.session_answers (session_id, participant_id, question_id, selected_answer, is_correct)
  values (p_session_id, p_participant_id, p_question_id, p_selected_answer, p_is_correct);

  -- Update score if correct
  if p_is_correct then
    update public.session_participants
    set score = score + 1
    where id = p_participant_id;
  end if;

  -- If the participant is logged in, sync this to their permanent global telemetry
  if v_user_id is not null then
    insert into public.question_attempts (user_id, question_id, topic_id, is_correct)
    select v_user_id, p_question_id, topic_id, p_is_correct
    from public.live_sessions where id = p_session_id;
  end if;
end;
$$;

-- Get my answers (for reconnects)
create or replace function public.get_participant_answers(
  p_participant_id uuid,
  p_participant_token uuid
) returns json
language plpgsql security definer set search_path = ''
as $$
declare
  v_result json;
begin
  if not exists (
    select 1 from public.session_participant_tokens 
    where participant_id = p_participant_id and participant_token = p_participant_token
  ) then
    raise exception 'Unauthorized';
  end if;

  select coalesce(json_agg(row_to_json(a)), '[]') into v_result
  from public.session_answers a
  where participant_id = p_participant_id;

  return v_result;
end;
$$;

-- Grant EXECUTE to public roles
grant execute on function public.create_live_session(text, text, text) to authenticated, anon;
grant execute on function public.join_live_session(text, text) to authenticated, anon;
grant execute on function public.advance_live_session(uuid, uuid, int, text) to authenticated, anon;
grant execute on function public.remove_participant(uuid, uuid, uuid) to authenticated, anon;
grant execute on function public.submit_live_answer(uuid, uuid, uuid, text, text, boolean) to authenticated, anon;
grant execute on function public.get_participant_answers(uuid, uuid) to authenticated, anon;
