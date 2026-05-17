-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Households table
create table households (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz default now()
);

-- Profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  display_name text not null,
  avatar_color text not null default '#6366f1',
  created_at timestamptz default now()
);

-- Expenses table
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null, -- stored in cents
  category text not null,
  description text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Shopping items table
create table shopping_items (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity text,
  is_checked boolean not null default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table households enable row level security;
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table shopping_items enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view household members profiles" on profiles
  for select using (
    household_id in (
      select household_id from profiles where id = auth.uid()
    )
  );

-- Households RLS
create policy "Users can view their household" on households
  for select using (
    id in (select household_id from profiles where id = auth.uid())
  );

create policy "Users can create households" on households
  for insert with check (true);

create policy "Members can update their household" on households
  for update using (
    id in (select household_id from profiles where id = auth.uid())
  );

-- Expenses RLS
create policy "Household members can view expenses" on expenses
  for select using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can insert expenses" on expenses
  for insert with check (
    household_id in (select household_id from profiles where id = auth.uid())
    and user_id = auth.uid()
  );

create policy "Expense owner can update" on expenses
  for update using (user_id = auth.uid());

create policy "Expense owner can delete" on expenses
  for delete using (user_id = auth.uid());

-- Shopping items RLS
create policy "Household members can view shopping items" on shopping_items
  for select using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can insert shopping items" on shopping_items
  for insert with check (
    household_id in (select household_id from profiles where id = auth.uid())
    and added_by = auth.uid()
  );

create policy "Household members can update shopping items" on shopping_items
  for update using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can delete shopping items" on shopping_items
  for delete using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

-- Function to handle new user profile creation
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    '#6366f1'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Enable realtime for expenses and shopping_items
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table shopping_items;
