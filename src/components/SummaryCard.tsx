import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export function SummaryCard({ label, value, icon, color }: SummaryCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { fontSize: 22, marginBottom: 8 },
  value: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  label: { fontSize: 11, color: '#64748b', fontWeight: '500' },
});
