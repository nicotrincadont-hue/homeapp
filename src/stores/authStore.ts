import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Household } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  household: Household | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setHousehold: (household: Household | null) => void;
  fetchProfile: () => Promise<void>;
  fetchHousehold: (householdId: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  household: null,
  loading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  setProfile: (profile) => set({ profile }),
  setHousehold: (household) => set({ household }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) {
      set({ profile: data });
      if (data.household_id) {
        await get().fetchHousehold(data.household_id);
      }
    }
    set({ loading: false });
  },

  fetchHousehold: async (householdId) => {
    const { data } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single();
    if (data) set({ household: data });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, household: null });
  },

  updateDisplayName: async (name) => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id)
      .select()
      .single();
    if (data) set({ profile: data });
  },
}));
