import React, { useEffect, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../stores/authStore';
import { useExpenseStore } from '../stores/expenseStore';
import { SummaryCard } from '../components/SummaryCard';
import { EmptyState } from '../components/EmptyState';
import { CATEGORY_CONFIG, CATEGORIES } from '../constants/categories';
import { Category } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 32;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: () => '#64748b',
  strokeWidth: 2,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#6366f1' },
};

export function InsightsScreen() {
  const { household } = useAuthStore();
  const { expenses, subscribeToExpenses, unsubscribe } = useExpenseStore();

  useEffect(() => {
    if (!household) return;
    subscribeToExpenses(household.id);
    return () => unsubscribe();
  }, [household?.id]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === currentMonth && d.getFullYear() === currentYear
        );
      }),
    [expenses, currentMonth, currentYear]
  );

  const totalThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const topCategory = useMemo(() => {
    const byCategory = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = monthExpenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      return acc;
    }, {} as Record<Category, number>);
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    return top
      ? { category: top[0] as Category, amount: top[1] }
      : null;
  }, [monthExpenses]);

  const biggestExpense = useMemo(
    () =>
      monthExpenses.reduce(
        (max, e) => (e.amount > (max?.amount ?? 0) ? e : max),
        null as (typeof monthExpenses)[0] | null
      ),
    [monthExpenses]
  );

  const pieData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const total = monthExpenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      return {
        name: CATEGORY_CONFIG[cat].label,
        amount: total,
        color: CATEGORY_CONFIG[cat].color,
        legendFontColor: '#64748b',
        legendFontSize: 12,
      };
    }).filter((d) => d.amount > 0);
  }, [monthExpenses]);

  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthExpns = expenses.filter((e) => {
        const ed = new Date(e.date);
        return (
          ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
        );
      });
      const total = monthExpns.reduce((s, e) => s + e.amount, 0);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        value: total / 100,
      });
    }
    return months;
  }, [expenses, currentMonth, currentYear]);

  const lineData = useMemo(() => {
    const days = Array.from({ length: now.getDate() }, (_, i) => i + 1);
    let cumulative = 0;
    const data = days.map((day) => {
      const dayExpenses = monthExpenses.filter(
        (e) => new Date(e.date).getDate() === day
      );
      cumulative += dayExpenses.reduce((s, e) => s + e.amount, 0);
      return cumulative / 100;
    });
    const labels = days
      .filter((_, i) => i % Math.ceil(days.length / 6) === 0)
      .map(String);
    return { data, labels };
  }, [monthExpenses, now]);

  if (expenses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Insights</Text>
        <EmptyState
          icon="📊"
          title="No data yet"
          subtitle="Add some expenses to see your spending insights"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="This Month"
            value={`$${(totalThisMonth / 100).toFixed(0)}`}
            icon="💰"
            color="#6366f1"
          />
          <SummaryCard
            label="Top Category"
            value={
              topCategory
                ? CATEGORY_CONFIG[topCategory.category].label
                : '—'
            }
            icon={
              topCategory
                ? CATEGORY_CONFIG[topCategory.category].icon
                : '📦'
            }
            color={
              topCategory
                ? CATEGORY_CONFIG[topCategory.category].color
                : '#6b7280'
            }
          />
          <SummaryCard
            label="Biggest Expense"
            value={
              biggestExpense
                ? `$${(biggestExpense.amount / 100).toFixed(0)}`
                : '—'
            }
            icon="🏆"
            color="#f59e0b"
          />
        </View>

        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute={false}
            />
          </View>
        )}

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Comparison</Text>
          <BarChart
            data={{
              labels: barData.map((d) => d.label),
              datasets: [{ data: barData.map((d) => d.value) }],
            }}
            width={CHART_WIDTH - 32}
            height={200}
            chartConfig={chartConfig}
            style={{ borderRadius: 12 }}
            yAxisLabel="$"
            yAxisSuffix=""
            showValuesOnTopOfBars
          />
        </View>

        {lineData.data.length > 1 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Cumulative Spending</Text>
            <LineChart
              data={{
                labels: lineData.labels,
                datasets: [{ data: lineData.data }],
              }}
              width={CHART_WIDTH - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12 }}
              yAxisLabel="$"
            />
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
});
