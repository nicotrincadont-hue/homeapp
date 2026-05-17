import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
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
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💸</Text>,
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text>,
          tabBarLabel: 'Insights',
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🛒</Text>,
          tabBarLabel: 'Shopping',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>⚙️</Text>,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function ExpenseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditExpense"
        component={EditExpenseScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { session, profile, setSession, fetchProfile, loading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile();
      } else {
        useAuthStore.setState({ loading: false });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile();
      } else {
        useAuthStore.setState({ loading: false });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {!session ? (
        <AuthStack />
      ) : !profile?.household_id ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Household" component={HouseholdScreen} />
        </Stack.Navigator>
      ) : (
        <ExpenseStack />
      )}
    </NavigationContainer>
  );
}
