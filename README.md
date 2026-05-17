# HomeApp — Household Expense Tracker

A cross-platform mobile app built with React Native + Expo for tracking household expenses in real time.

## Features

- **Shared Households**: Create or join a household with a unique invite code
- **Expense Tracking**: Add, edit, delete expenses with categories, descriptions, and dates
- **Real-time Insights**: Pie, bar, and line charts that auto-update via Supabase real-time subscriptions
- **Shared Shopping List**: Real-time list visible and editable by all household members (swipe to delete)
- **Offline Support**: Banner shown when offline, write actions disabled gracefully

## Tech Stack

- React Native + Expo SDK 51
- Supabase (Auth, PostgreSQL, Real-time subscriptions)
- React Navigation (Bottom Tabs + Stack navigators)
- react-native-chart-kit (Pie, Bar, Line charts)
- Zustand (State management)
- TypeScript throughout

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click **New Project** and fill in the details
3. Once created, go to **Settings → API**
4. Note your **Project URL** and **anon public** key — you'll need these shortly

### 2. Run the SQL Schema

1. In your Supabase dashboard, open **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the full contents of `supabase/schema.sql` from this repo
4. Paste it into the editor and click **Run**
5. This creates all tables (`households`, `profiles`, `expenses`, `shopping_items`), RLS policies, real-time publications, and the trigger to auto-create profiles on signup

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> The `EXPO_PUBLIC_` prefix is required for Expo to expose these to the app bundle.

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Expo Dev Server

```bash
npm start
```

Then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Scan the QR code with the **Expo Go** app on your physical device

---

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `households` | Shared household record with a unique 8-char invite code |
| `profiles` | One per user; linked to `auth.users` and a `household` |
| `expenses` | All household expenses; amounts stored in **cents** |
| `shopping_items` | Shared shopping list items with checked state |

### Row Level Security

All four tables have RLS enabled. Key rules:

- Users can only read/write data that belongs to **their household**
- Expense owners can update and delete their own expenses
- Any household member can check/uncheck or delete shopping items
- The `profiles` trigger auto-creates a profile row when a new user signs up

### Real-time

`expenses` and `shopping_items` are added to the `supabase_realtime` publication. The app subscribes to Postgres changes filtered by `household_id`, so all clients receive instant updates whenever data changes.

---

## App Flow

1. **Sign up** with name, email, and password
2. **Create** a household (gives you an 8-character invite code) **or Join** one by entering a friend's code
3. **Add expenses** from the Expenses tab — long-press a card to edit or delete
4. **View insights** on the Insights tab — charts auto-refresh in real time
5. **Manage the shopping list** — check off items, swipe left to delete, clear all done items at once
6. **Settings** — copy the invite code to share with housemates, edit your display name, sign out

---

## Notes

- All monetary amounts are stored as **integers (cents)** to avoid floating-point precision issues. `$12.99` is stored as `1299`.
- Real-time sync uses Supabase Postgres Changes subscriptions over WebSocket.
- The app checks network state every 5 seconds and shows a warning banner when offline.
