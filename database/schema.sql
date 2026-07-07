-- WonderfulLife GitHub-ready repository schema
-- Run this in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  primary_goal text default 'More Energy',
  activity_level text default 'Beginner',
  role text default 'member',
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.content_items (
  id bigint generated always as identity primary key,
  created_by uuid references auth.users(id) on delete set null,
  type text not null check (type in ('article','recipe','video','product','guide','course')),
  title text not null,
  slug text not null,
  excerpt text,
  body text,
  category text default 'Wellness',
  status text default 'draft' check (status in ('draft','published','archived')),
  featured boolean default false,
  image_url text,
  video_url text,
  external_url text,
  tags text[] default '{}',
  reading_minutes int default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(type, slug)
);

create table if not exists public.saved_content (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id bigint references public.content_items(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, content_id)
);

create table if not exists public.wellness_journeys (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  goal text not null,
  start_date date default current_date,
  current_day int default 1,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.habit_checkins (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  journey_id bigint references public.wellness_journeys(id) on delete cascade,
  checkin_date date default current_date,
  habits jsonb default '[]'::jsonb,
  score int default 0,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, journey_id, checkin_date)
);

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.saved_content enable row level security;
alter table public.wellness_journeys enable row level security;
alter table public.habit_checkins enable row level security;

drop policy if exists "Profiles owner" on public.profiles;
drop policy if exists "Content read published" on public.content_items;
drop policy if exists "Content authenticated write" on public.content_items;
drop policy if exists "Saved owner" on public.saved_content;
drop policy if exists "Journeys owner" on public.wellness_journeys;
drop policy if exists "Checkins owner" on public.habit_checkins;

create policy "Profiles owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Content read published" on public.content_items for select using (status = 'published' or auth.uid() is not null);
create policy "Content authenticated write" on public.content_items for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Saved owner" on public.saved_content for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Journeys owner" on public.wellness_journeys for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Checkins owner" on public.habit_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id,email,display_name)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name','WonderfulLife Member'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
