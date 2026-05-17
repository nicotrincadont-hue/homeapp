export type Category =
  | 'groceries'
  | 'utilities'
  | 'rent'
  | 'subscriptions'
  | 'transport'
  | 'health'
  | 'entertainment'
  | 'other';

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string | null;
  display_name: string;
  avatar_color: string;
  created_at: string;
}

export interface Expense {
  id: string;
  household_id: string;
  user_id: string;
  amount: number; // in cents
  category: Category;
  description: string | null;
  date: string; // ISO date string
  created_at: string;
  profiles?: Profile;
}

export interface ShoppingItem {
  id: string;
  household_id: string;
  added_by: string;
  name: string;
  quantity: string | null;
  is_checked: boolean;
  created_at: string;
}

export type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
