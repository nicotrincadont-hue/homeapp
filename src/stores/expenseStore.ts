import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Expense, Category, SortOrder } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  sortOrder: SortOrder;
  filterCategory: Category | 'all';
  channel: RealtimeChannel | null;
  setSortOrder: (order: SortOrder) => void;
  setFilterCategory: (cat: Category | 'all') => void;
  fetchExpenses: (householdId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'profiles'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  subscribeToExpenses: (householdId: string) => void;
  unsubscribe: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  sortOrder: 'date_desc',
  filterCategory: 'all',
  channel: null,

  setSortOrder: (sortOrder) => set({ sortOrder }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),

  fetchExpenses: async (householdId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('expenses')
      .select('*, profiles(display_name, avatar_color)')
      .eq('household_id', householdId)
      .order('date', { ascending: false });
    set({ expenses: data ?? [], loading: false });
  },

  addExpense: async (expense) => {
    const { error } = await supabase.from('expenses').insert(expense);
    if (error) throw error;
  },

  updateExpense: async (id, updates) => {
    const { error } = await supabase.from('expenses').update(updates).eq('id', id);
    if (error) throw error;
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
  },

  subscribeToExpenses: (householdId) => {
    const { unsubscribe } = get();
    unsubscribe();
    const channel = supabase
      .channel(`expenses:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `household_id=eq.${householdId}` },
        async () => {
          await get().fetchExpenses(householdId);
        }
      )
      .subscribe();
    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));
