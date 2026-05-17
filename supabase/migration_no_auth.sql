-- Migration: Remove auth dependency
-- Run this in your Supabase SQL Editor AFTER the original schema.sql

-- Drop auth-dependent foreign key constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE shopping_items DROP CONSTRAINT IF EXISTS shopping_items_added_by_fkey;

-- Disable RLS on all tables (safe for a private household app)
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items DISABLE ROW LEVEL SECURITY;

-- Drop the auth trigger (no longer needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
