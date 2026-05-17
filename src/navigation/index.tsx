import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HouseholdScreen } from '../screens/auth/HouseholdScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/EditExpenseScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: '#f1f5f9',
          backgroundColor: '#fff',
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>💸</Text> }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text> }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>🛒</Text>, tabBarLabel: 'Shopping' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { userId, household, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!userId ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      ) : !household ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Household" component={HouseholdScreen} />
        </Stack.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}
