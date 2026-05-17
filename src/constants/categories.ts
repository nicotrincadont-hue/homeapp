import { Category } from '../types';

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; icon: string }
> = {
  groceries: { label: 'Groceries', color: '#22c55e', icon: '🛒' },
  utilities: { label: 'Utilities', color: '#3b82f6', icon: '💡' },
  rent: { label: 'Rent', color: '#f59e0b', icon: '🏠' },
  subscriptions: { label: 'Subscriptions', color: '#8b5cf6', icon: '📱' },
  transport: { label: 'Transport', color: '#06b6d4', icon: '🚗' },
  health: { label: 'Health', color: '#ef4444', icon: '❤️' },
  entertainment: { label: 'Entertainment', color: '#f97316', icon: '🎬' },
  other: { label: 'Other', color: '#6b7280', icon: '📦' },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

export const AVATAR_COLORS = [
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];
