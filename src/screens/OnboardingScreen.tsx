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
import { useAuthStore } from '../stores/authStore';
import { AVATAR_COLORS } from '../constants/categories';

export function OnboardingScreen() {
  const { createProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      await createProfile(name.trim(), color);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>🏠</Text>
          <Text style={styles.title}>Welcome to HomeApp</Text>
          <Text style={styles.subtitle}>Just tell us who you are — no account needed</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Nico"
              autoCapitalize="words"
              autoFocus
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Pick a color</Text>
            <View style={styles.colors}>
              {AVATAR_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <View style={styles.preview}>
              <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : '?'}</Text>
              </View>
              <Text style={styles.previewName}>{name || 'Your name'}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!name.trim() || loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Setting up...' : 'Continue →'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 18, backgroundColor: '#f8fafc', color: '#1e293b', fontWeight: '600' },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: '#1e293b', transform: [{ scale: 1.15 }] },
  preview: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  previewName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  button: { backgroundColor: '#6366f1', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
