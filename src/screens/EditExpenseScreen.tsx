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
import { useExpenseStore } from '../stores/expenseStore';
import { Expense, Category } from '../types';
import { CATEGORIES, CATEGORY_CONFIG } from '../constants/categories';

export function EditExpenseScreen({ navigation, route }: any) {
  const { expense } = route.params as { expense: Expense };
  const { updateExpense, deleteExpense } = useExpenseStore();

  const [amount, setAmount] = useState(String(expense.amount / 100));
  const [category, setCategory] = useState<Category>(expense.category);
  const [description, setDescription] = useState(expense.description ?? '');
  const [date, setDate] = useState(expense.date);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const dollars = parseFloat(amount);
    if (!amount || isNaN(dollars) || dollars <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await updateExpense(expense.id, {
        amount: Math.round(dollars * 100),
        category,
        description: description.trim() || null,
        date,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expense.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Expense</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.save, loading && { opacity: 0.5 }]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.amountContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categories}>
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const selected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catBtn,
                      selected && {
                        backgroundColor: cfg.color,
                        borderColor: cfg.color,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={styles.catIcon}>{cfg.icon}</Text>
                    <Text
                      style={[styles.catLabel, selected && { color: '#fff' }]}
                    >
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              multiline
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Expense</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cancel: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  save: { color: '#6366f1', fontSize: 16, fontWeight: '700' },
  scroll: { padding: 20 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dollarSign: { fontSize: 40, color: '#94a3b8', fontWeight: '300' },
  amountInput: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 120,
    textAlign: 'center',
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
