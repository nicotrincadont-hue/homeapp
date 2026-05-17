import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Profile, Household } from '../types';

const KEYS = {
  userId: '@homeapp/userId',
  householdId: '@homeapp/householdId',
};

function makeUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  household: Household | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  createProfile: (displayName: string, color: string) => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<boolean>;
  updateDisplayName: (name: string) => Promise<void>;
  reset: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  household: null,
  initialized: false,

  initialize: async () => {
    const userId = await AsyncStorage.getItem(KEYS.userId);
    const householdId = await AsyncStorage.getItem(KEYS.householdId);

    if (!userId) {
      set({ initialized: true });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let household = null;
    if (householdId) {
      const { data } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .single();
      household = data ?? null;
    }

    set({ userId, profile: profile ?? null, household, initialized: true });
  },

  createProfile: async (displayName, color) => {
    const userId = makeUUID();
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, display_name: displayName, avatar_color: color })
      .select()
      .single();
    if (error) throw error;
    await AsyncStorage.setItem(KEYS.userId, userId);
    set({ userId, profile: data });
  },

  createHousehold: async (name) => {
    const { userId } = get();
    if (!userId) throw new Error('No user');
    const { data: household, error } = await supabase
      .from('households')
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('profiles').update({ household_id: household.id }).eq('id', userId);
    await AsyncStorage.setItem(KEYS.householdId, household.id);
    set({ household });
  },

  joinHousehold: async (inviteCode) => {
    const { userId } = get();
    if (!userId) throw new Error('No user');
    const { data: household } = await supabase
      .from('households')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();
    if (!household) return false;
    await supabase.from('profiles').update({ household_id: household.id }).eq('id', userId);
    await AsyncStorage.setItem(KEYS.householdId, household.id);
    set({ household });
    return true;
  },

  updateDisplayName: async (name) => {
    const { userId } = get();
    if (!userId) return;
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', userId)
      .select()
      .single();
    if (data) set({ profile: data });
  },

  reset: async () => {
    await AsyncStorage.multiRemove([KEYS.userId, KEYS.householdId]);
    set({ userId: null, profile: null, household: null });
  },
}));
