import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

export function HouseholdScreen() {
  const { user, fetchProfile } = useAuthStore();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert('Error', 'Please enter a household name');
      return;
    }
    setLoading(true);
    const { data: household, error: hhError } = await supabase
      .from('households')
      .insert({ name: householdName.trim() })
      .select()
      .single();
    if (hhError || !household) {
      setLoading(false);
      Alert.alert('Error', hhError?.message ?? 'Failed to create household');
      return;
    }
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ household_id: household.id })
      .eq('id', user!.id);
    setLoading(false);
    if (profileError) {
      Alert.alert('Error', profileError.message);
      return;
    }
    await fetchProfile();
  };

  const joinHousehold = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    setLoading(true);
    const { data: household, error: hhError } = await supabase
      .from('households')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();
    if (hhError || !household) {
      setLoading(false);
      Alert.alert('Invalid Code', 'No household found with that invite code');
      return;
    }
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ household_id: household.id })
      .eq('id', user!.id);
    setLoading(false);
    if (profileError) {
      Alert.alert('Error', profileError.message);
      return;
    }
    await fetchProfile();
  };

  if (mode === 'choose') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🏡</Text>
          <Text style={styles.title}>Set Up Your Household</Text>
          <Text style={styles.subtitle}>
            Create a new household or join an existing one with an invite code
          </Text>
        </View>
        <TouchableOpacity style={styles.card} onPress={() => setMode('create')}>
          <Text style={styles.cardIcon}>✨</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Create a Household</Text>
            <Text style={styles.cardDesc}>Start fresh and invite others</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setMode('join')}>
          <Text style={styles.cardIcon}>🔗</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Join a Household</Text>
            <Text style={styles.cardDesc}>Enter an invite code to join</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setMode('choose')} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.emoji}>{mode === 'create' ? '✨' : '🔗'}</Text>
          <Text style={styles.title}>
            {mode === 'create' ? 'Create Household' : 'Join Household'}
          </Text>
        </View>
        <View style={styles.form}>
          {mode === 'create' ? (
            <>
              <Text style={styles.label}>Household Name</Text>
              <TextInput
                style={styles.input}
                value={householdName}
                onChangeText={setHouseholdName}
                placeholder="e.g. Smith Family, Apartment 4B"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={createHousehold}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating...' : 'Create Household'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="XXXXXXXX"
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={joinHousehold}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join Household'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  scroll: { flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: { fontSize: 28, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  arrow: { fontSize: 18, color: '#94a3b8' },
  back: { marginTop: 16, marginBottom: 8 },
  backText: { color: '#6366f1', fontSize: 15, fontWeight: '600' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  codeInput: { textAlign: 'center', fontSize: 24, fontWeight: '700', letterSpacing: 6 },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
