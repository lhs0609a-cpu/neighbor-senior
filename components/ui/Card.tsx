import React from 'react';
import { View, TouchableOpacity, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  onPress,
  children,
  style,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-2xl overflow-hidden';

  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg shadow-black/10',
    outlined: 'bg-white border border-gray-200',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]}`;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`${className} active:opacity-90`}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={className} style={style} {...props}>
      {children}
    </View>
  );
}
