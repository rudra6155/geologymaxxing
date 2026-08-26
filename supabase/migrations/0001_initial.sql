-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  std int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles RLS policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );

-- Create topic_progress table
create table public.topic_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic_id text not null,
  status text not null check (status in ('in_progress', 'completed')),
  last_viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, topic_id)
);

-- Enable RLS
alter table public.topic_progress enable row level security;

-- Topic progress RLS policies
create policy "Users can view own topic progress" 
  on public.topic_progress for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own topic progress" 
  on public.topic_progress for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update own topic progress" 
  on public.topic_progress for update 
  using ( auth.uid() = user_id );

-- Create question_attempts table
create table public.question_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  question_id text not null,
  topic_id text not null,
  is_correct boolean not null,
  attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.question_attempts enable row level security;

-- Question attempts RLS policies
create policy "Users can view own question attempts" 
  on public.question_attempts for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own question attempts" 
  on public.question_attempts for insert 
  with check ( auth.uid() = user_id );

-- Create gauntlet_runs table
create table public.gauntlet_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic_id text not null,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone not null,
  result text not null check (result in ('cleared', 'broken')),
  max_streak int not null
);

-- Enable RLS
alter table public.gauntlet_runs enable row level security;

-- Gauntlet runs RLS policies
create policy "Users can view own gauntlet runs" 
  on public.gauntlet_runs for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own gauntlet runs" 
  on public.gauntlet_runs for insert 
  with check ( auth.uid() = user_id );
-- Grant table permissions to authenticated, anon, and service_role roles
grant select, insert, update, delete on public.profiles to authenticated, anon, service_role;
grant select, insert, update, delete on public.topic_progress to authenticated, anon, service_role;
grant select, insert, update, delete on public.question_attempts to authenticated, anon, service_role;
grant select, insert, update, delete on public.gauntlet_runs to authenticated, anon, service_role;

