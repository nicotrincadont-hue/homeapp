import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category } from '../types';
import { CATEGORY_CONFIG } from '../constants/categories';

interface CategoryIconProps {
  category: Category;
  size?: number;
}

export function CategoryIcon({ category, size = 44 }: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category];
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: config.color + '20' },
      ]}
    >
      <Text style={{ fontSize: size * 0.45 }}>{config.icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
