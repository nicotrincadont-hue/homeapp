import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useShoppingStore } from '../stores/shoppingStore';
import { ShoppingItem } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { OfflineBanner } from '../components/OfflineBanner';

function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -80) {
          Animated.timing(translateX, {
            toValue: -100,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onDelete(item.id);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.itemWrapper}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.deleteAction}
        >
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.itemRow, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            item.is_checked && styles.checkboxChecked,
          ]}
          onPress={() => onToggle(item.id, !item.is_checked)}
        >
          {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemName,
              item.is_checked && styles.itemNameChecked,
            ]}
          >
            {item.name}
          </Text>
          {item.quantity ? (
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

export function ShoppingListScreen() {
  const { household, user } = useAuthStore();
  const {
    items,
    loading,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem,
    clearCompleted,
    subscribeToItems,
    unsubscribe,
  } = useShoppingStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!household) return;
    fetchItems(household.id);
    subscribeToItems(household.id);
    return () => unsubscribe();
  }, [household?.id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleAdd = async () => {
    if (!newItemName.trim() || !household || !user) return;
    try {
      await addItem({
        household_id: household.id,
        added_by: user.id,
        name: newItemName.trim(),
        quantity: newItemQty.trim() || null,
      });
      setNewItemName('');
      setNewItemQty('');
      showToast('Item added to list');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      await toggleItem(id, checked);
      if (checked) showToast('Item checked ✓');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      showToast('Item removed');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleClearCompleted = () => {
    const checked = items.filter((i) => i.is_checked);
    if (checked.length === 0) return;
    Alert.alert(
      'Clear Completed',
      `Remove ${checked.length} checked item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCompleted(household!.id);
            showToast(`Cleared ${checked.length} items`);
          },
        },
      ]
    );
  };

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);
  const sorted = [...unchecked, ...checked];
  const checkedCount = checked.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        {checkedCount > 0 && (
          <TouchableOpacity
            onPress={handleClearCompleted}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Clear {checkedCount} done</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.addBar}>
        <TextInput
          ref={inputRef}
          style={styles.addInput}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Add item..."
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TextInput
          style={[styles.addInput, styles.qtyInput]}
          value={newItemQty}
          onChangeText={setNewItemQty}
          placeholder="Qty"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShoppingItemRow
            item={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={
          sorted.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="🛒"
            title="List is empty"
            subtitle="Add items above and share the list with your household members"
          />
        }
        showsVerticalScrollIndicator={false}
      />

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
  clearBtn: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  addBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  qtyInput: { flex: 0, width: 70 },
  addBtn: {
    backgroundColor: '#6366f1',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  list: { paddingBottom: 20 },
  emptyContainer: { flex: 1 },
  itemWrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ef4444',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 16,
  },
  deleteAction: { padding: 8 },
  deleteActionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  itemNameChecked: { textDecorationLine: 'line-through', color: '#94a3b8' },
  itemQty: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
