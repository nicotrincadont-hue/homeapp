# HomeApp — Household Expense Tracker

A cross-platform mobile app built with React Native + Expo for tracking household expenses in real time.

## Features

- **Shared Households**: Create or join a household with an invite code
- **Expense Tracking**: Add, edit, delete expenses with categories, descriptions, and dates
- **Real-time Insights**: Charts that auto-update via Supabase real-time subscriptions
- **Shared Shopping List**: Real-time list visible and editable by all household members
- **Offline Support**: Banner shown when offline, write actions disabled

## Tech Stack

- React Native + Expo SDK 51
- Supabase (Auth, PostgreSQL, Real-time)
- React Navigation (Bottom Tabs + Stack)
- react-native-chart-kit (Pie, Bar, Line charts)
- Zustand (State management)
- TypeScript

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public** key from Settings > API

### 2. Run the SQL Schema

1. In your Supabase dashboard, open the **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste into the SQL editor and click **Run**
4. This creates all tables, RLS policies, and real-time subscriptions

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Expo Dev Server

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

---

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `households` | Shared household with unique invite code |
| `profiles` | User profiles linked to auth.users |
| `expenses` | All household expenses (amounts in cents) |
| `shopping_items` | Shared shopping list items |

### Row Level Security

All tables have RLS enabled. Users can only read/write data belonging to their household.

---

## Usage

1. **Sign up** with email and password
2. **Create** a household (or **join** one with an invite code)
3. **Add expenses** from the Expenses tab
4. **View insights** — charts auto-update in real time
5. **Manage shopping list** — shared with all household members
6. **Settings** — copy invite code to share with housemates, edit display name, sign out

---

## Notes

- All monetary amounts are stored as integers (cents) to avoid floating-point precision issues
- Real-time sync uses Supabase Postgres Changes subscriptions
- The app gracefully handles offline scenarios with a banner and disabled write actions
