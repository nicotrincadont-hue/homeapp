import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useExpenseStore } from '../stores/expenseStore';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { OfflineBanner } from '../components/OfflineBanner';
import { Expense, Category, SortOrder } from '../types';
import { CATEGORIES, CATEGORY_CONFIG } from '../constants/categories';

export function ExpensesScreen({ navigation }: any) {
  const { household } = useAuthStore();
  const {
    expenses,
    loading,
    sortOrder,
    filterCategory,
    fetchExpenses,
    subscribeToExpenses,
    unsubscribe,
    setSortOrder,
    setFilterCategory,
  } = useExpenseStore();
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!household) return;
    fetchExpenses(household.id);
    subscribeToExpenses(household.id);
    return () => unsubscribe();
  }, [household?.id]);

  const filtered = expenses.filter(
    (e) => filterCategory === 'all' || e.category === filterCategory
  );
  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'amount_asc':
        return a.amount - b.amount;
      case 'amount_desc':
        return b.amount - a.amount;
    }
  });

  const handleEdit = (expense: Expense) => {
    navigation.navigate('EditExpense', { expense });
  };

  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
    { key: 'date_desc', label: 'Newest First' },
    { key: 'date_asc', label: 'Oldest First' },
    { key: 'amount_desc', label: 'Highest Amount' },
    { key: 'amount_asc', label: 'Lowest Amount' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Expenses</Text>
          <Text style={styles.monthTotal}>This month: ${(monthTotal / 100).toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddExpense')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowSort(true)}>
          <Text style={styles.filterBtnText}>Sort ↕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filterCategory !== 'all' && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text
            style={[
              styles.filterBtnText,
              filterCategory !== 'all' && styles.filterBtnTextActive,
            ]}
          >
            {filterCategory === 'all'
              ? 'All Categories'
              : CATEGORY_CONFIG[filterCategory].label}
          </Text>
        </TouchableOpacity>
        {filterCategory !== 'all' && (
          <TouchableOpacity onPress={() => setFilterCategory('all')} style={styles.clearFilter}>
            <Text style={styles.clearFilterText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View>
          {[1, 2, 3, 4].map((k) => (
            <ExpenseCardSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExpenseCard expense={item} onEdit={handleEdit} />}
          contentContainerStyle={sorted.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="💸"
              title="No expenses yet"
              subtitle="Tap '+ Add' to record your first expense and start tracking"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showSort} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowSort(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, sortOrder === opt.key && styles.modalOptionActive]}
                onPress={() => {
                  setSortOrder(opt.key);
                  setShowSort(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortOrder === opt.key && styles.modalOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showFilter} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowFilter(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            <TouchableOpacity
              style={[styles.modalOption, filterCategory === 'all' && styles.modalOptionActive]}
              onPress={() => {
                setFilterCategory('all');
                setShowFilter(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  filterCategory === 'all' && styles.modalOptionTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.modalOption,
                  filterCategory === cat && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setFilterCategory(cat);
                  setShowFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    filterCategory === cat && styles.modalOptionTextActive,
                  ]}
                >
                  {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  monthTotal: { fontSize: 13, color: '#64748b', marginTop: 2 },
  addBtn: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },
  clearFilter: { padding: 6, backgroundColor: '#e2e8f0', borderRadius: 8 },
  clearFilterText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  list: { paddingBottom: 20 },
  emptyContainer: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  modalOption: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  modalOptionActive: { backgroundColor: '#6366f120' },
  modalOptionText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  modalOptionTextActive: { color: '#6366f1', fontWeight: '700' },
});
