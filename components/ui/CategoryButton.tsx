import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/constants/prices';
import type { ServiceCategory } from '@/types';

interface CategoryButtonProps {
  category: ServiceCategory;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function CategoryButton({
  category,
  selected = false,
  size = 'md',
  onPress,
}: CategoryButtonProps) {
  const icon = CATEGORY_ICONS[category] ?? '📌';
  const name = CATEGORY_NAMES[category] ?? category;

  const sizeClasses = {
    sm: {
      container: 'w-16 h-16',
      icon: 'text-xl',
      text: 'text-xs',
    },
    md: {
      container: 'w-20 h-20',
      icon: 'text-2xl',
      text: 'text-xs',
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'text-3xl',
      text: 'text-sm',
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        ${sizeClasses[size].container}
        items-center justify-center rounded-2xl
        ${selected ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-100'}
        active:opacity-80
      `}
    >
      <Text className={sizeClasses[size].icon}>{icon}</Text>
      <Text
        className={`
          ${sizeClasses[size].text}
          mt-1 text-center
          ${selected ? 'text-primary-700 font-semibold' : 'text-gray-700'}
        `}
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// 카테고리 그리드 컴포넌트
interface CategoryGridProps {
  categories?: ServiceCategory[];
  selectedCategory?: ServiceCategory;
  onSelectCategory?: (category: ServiceCategory) => void;
  columns?: 4 | 5;
}

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  'childcare',
  'housework',
  'errand',
  'digital_help',
  'mobility',
  'physical_help',
  'health',
  'consultation',
];

export function CategoryGrid({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  columns = 4,
}: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <CategoryButton
          key={category}
          category={category}
          selected={selectedCategory === category}
          onPress={() => onSelectCategory?.(category)}
        />
      ))}
    </View>
  );
}
