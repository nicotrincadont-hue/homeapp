import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ShoppingItem } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ShoppingState {
  items: ShoppingItem[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchItems: (householdId: string) => Promise<void>;
  addItem: (item: Omit<ShoppingItem, 'id' | 'created_at' | 'is_checked'>) => Promise<void>;
  toggleItem: (id: string, checked: boolean) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearCompleted: (householdId: string) => Promise<void>;
  subscribeToItems: (householdId: string) => void;
  unsubscribe: () => void;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  loading: false,
  channel: null,

  fetchItems: async (householdId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });
    set({ items: data ?? [], loading: false });
  },

  addItem: async (item) => {
    const { error } = await supabase.from('shopping_items').insert({ ...item, is_checked: false });
    if (error) throw error;
  },

  toggleItem: async (id, checked) => {
    const { error } = await supabase
      .from('shopping_items')
      .update({ is_checked: checked })
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, is_checked: checked } : i)),
    }));
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('shopping_items').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clearCompleted: async (householdId) => {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('household_id', householdId)
      .eq('is_checked', true);
    if (error) throw error;
    set((state) => ({ items: state.items.filter((i) => !i.is_checked) }));
  },

  subscribeToItems: (householdId) => {
    const { unsubscribe } = get();
    unsubscribe();
    const channel = supabase
      .channel(`shopping:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_items', filter: `household_id=eq.${householdId}` },
        async () => {
          await get().fetchItems(householdId);
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
