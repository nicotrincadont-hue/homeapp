import React, { useState } from 'react';
import {
  Alert,
  Clipboard,
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

export function SettingsScreen() {
  const { profile, household, signOut, updateDisplayName } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    await updateDisplayName(displayName.trim());
    setSaving(false);
    setEditingName(false);
    Alert.alert('Saved', 'Display name updated');
  };

  const handleCopyCode = () => {
    if (household?.invite_code) {
      Clipboard.setString(household.invite_code);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.card}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: profile?.avatar_color ?? '#6366f1' },
                ]}
              >
                <Text style={styles.avatarText}>
                  {(profile?.display_name ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                {editingName ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.nameInput}
                      value={displayName}
                      onChangeText={setDisplayName}
                      autoFocus
                      placeholder="Display name"
                    />
                    <TouchableOpacity
                      onPress={handleSaveName}
                      disabled={saving}
                    >
                      <Text style={styles.saveText}>{saving ? '...' : 'Save'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingName(false);
                        setDisplayName(profile?.display_name ?? '');
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.nameRow}>
                    <Text style={styles.displayName}>
                      {profile?.display_name}
                    </Text>
                    <TouchableOpacity onPress={() => setEditingName(true)}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {household && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Household</Text>
              <View style={styles.card}>
                <View style={styles.householdInfo}>
                  <Text style={styles.householdName}>{household.name}</Text>
                  <Text style={styles.householdSub}>
                    Share this code to invite others
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.inviteCode}
                  onPress={handleCopyCode}
                >
                  <Text style={styles.inviteCodeText}>
                    {household.invite_code}
                  </Text>
                  <Text style={styles.copyHint}>Tap to copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  editText: { color: '#6366f1', fontSize: 14, fontWeight: '600' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
  },
  saveText: { color: '#6366f1', fontWeight: '700', fontSize: 14 },
  cancelText: { color: '#94a3b8', fontSize: 14 },
  householdInfo: { flex: 1 },
  householdName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  householdSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  inviteCode: {
    backgroundColor: '#6366f110',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  inviteCodeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 3,
  },
  copyHint: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  signOutBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  signOutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
