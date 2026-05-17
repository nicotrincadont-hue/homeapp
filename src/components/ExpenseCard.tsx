import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_CONFIG } from '../constants/categories';
import { useExpenseStore } from '../stores/expenseStore';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  const { deleteExpense } = useExpenseStore();
  const config = CATEGORY_CONFIG[expense.category];

  const handleLongPress = () => {
    Alert.alert('Expense Options', undefined, [
      { text: 'Edit', onPress: () => onEdit(expense) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Expense', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expense.id) },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onLongPress={handleLongPress} activeOpacity={0.7}>
      <CategoryIcon category={expense.category} size={44} />
      <View style={styles.content}>
        <Text style={styles.category}>{config.label}</Text>
        {expense.description ? (
          <Text style={styles.description} numberOfLines={1}>{expense.description}</Text>
        ) : null}
        <Text style={styles.meta}>
          {(expense.profiles as any)?.display_name ?? 'You'} · {formatDate(expense.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: config.color }]}>{formatCents(expense.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: { flex: 1 },
  category: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  description: { fontSize: 13, color: '#64748b', marginTop: 2 },
  meta: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '700' },
});
