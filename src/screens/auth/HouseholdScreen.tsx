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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

export function HouseholdScreen() {
  const { createHousehold, joinHousehold } = useAuthStore();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!householdName.trim()) {
      Alert.alert('Please enter a name for your household');
      return;
    }
    setLoading(true);
    try {
      await createHousehold(householdName.trim());
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Please enter an invite code');
      return;
    }
    setLoading(true);
    const found = await joinHousehold(inviteCode.trim());
    setLoading(false);
    if (!found) Alert.alert('Not found', 'No household with that invite code. Double-check and try again.');
  };

  if (mode === 'choose') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emoji}>🏡</Text>
        <Text style={styles.title}>Set Up Your Household</Text>
        <Text style={styles.subtitle}>Create a new household or join your partner's using their invite code</Text>
        <TouchableOpacity style={styles.card} onPress={() => setMode('create')}>
          <Text style={styles.cardIcon}>✨</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Create a Household</Text>
            <Text style={styles.cardDesc}>Start fresh — you'll get an invite code to share</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setMode('join')}>
          <Text style={styles.cardIcon}>🔗</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Join a Household</Text>
            <Text style={styles.cardDesc}>Enter the invite code from your partner's Settings</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode('choose')} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.emoji}>{mode === 'create' ? '✨' : '🔗'}</Text>
          <Text style={styles.title}>{mode === 'create' ? 'Create Household' : 'Join Household'}</Text>

          <View style={styles.formCard}>
            {mode === 'create' ? (
              <>
                <Text style={styles.label}>Household Name</Text>
                <TextInput
                  style={styles.input}
                  value={householdName}
                  onChangeText={setHouseholdName}
                  placeholder="e.g. Our Apartment"
                  autoCapitalize="words"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleCreate}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create'}</Text>
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
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleJoin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  scroll: { flexGrow: 1 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: 32, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardIcon: { fontSize: 28, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  arrow: { fontSize: 18, color: '#94a3b8' },
  back: { marginBottom: 16 },
  backText: { color: '#6366f1', fontSize: 15, fontWeight: '600' },
  formCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#f8fafc', color: '#1e293b' },
  codeInput: { textAlign: 'center', fontSize: 24, fontWeight: '700', letterSpacing: 6 },
  button: { backgroundColor: '#6366f1', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
