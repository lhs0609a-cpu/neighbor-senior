import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'md' | 'lg' | 'senior';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      md: 'py-3 px-4 text-base',
      lg: 'py-4 px-5 text-lg',
      senior: 'py-5 px-5 text-xl min-h-[60px]', // 시니어용
    };

    const labelSizeClasses = {
      md: 'text-sm',
      lg: 'text-base',
      senior: 'text-lg font-medium',
    };

    const borderClasses = error
      ? 'border-red-500'
      : 'border-gray-300 focus:border-primary-500';

    return (
      <View className="w-full">
        {label && (
          <Text className={`${labelSizeClasses[size]} text-gray-700 mb-2 font-medium`}>
            {label}
          </Text>
        )}
        <View className="relative">
          {leftIcon && (
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              {leftIcon}
            </View>
          )}
          <TextInput
            ref={ref}
            className={`
              w-full rounded-xl border bg-white
              ${sizeClasses[size]}
              ${borderClasses}
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              text-gray-900
            `}
            placeholderTextColor="#9CA3AF"
            style={style}
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="absolute right-4 top-0 bottom-0 justify-center"
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {hint && !error && (
          <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
        )}
        {error && (
          <Text className="text-sm text-red-500 mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
