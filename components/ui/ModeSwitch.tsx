import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useModeStore, type AppMode } from '@/stores';

interface ModeSwitchProps {
  size?: 'md' | 'lg';
}

export function ModeSwitch({ size = 'md' }: ModeSwitchProps) {
  const { mode, toggleMode } = useModeStore();

  const isRequester = mode === 'requester';

  const sizeClasses = {
    md: {
      container: 'h-10 rounded-full',
      button: 'px-4 py-2',
      text: 'text-sm font-medium',
    },
    lg: {
      container: 'h-12 rounded-full',
      button: 'px-6 py-3',
      text: 'text-base font-semibold',
    },
  };

  return (
    <View className={`flex-row bg-gray-200 p-1 ${sizeClasses[size].container}`}>
      <TouchableOpacity
        onPress={() => mode !== 'requester' && toggleMode()}
        className={`
          flex-1 items-center justify-center rounded-full
          ${sizeClasses[size].button}
          ${isRequester ? 'bg-primary-600' : 'bg-transparent'}
        `}
      >
        <Text
          className={`
            ${sizeClasses[size].text}
            ${isRequester ? 'text-white' : 'text-gray-600'}
          `}
        >
          도움 요청
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => mode !== 'provider' && toggleMode()}
        className={`
          flex-1 items-center justify-center rounded-full
          ${sizeClasses[size].button}
          ${!isRequester ? 'bg-senior-warm' : 'bg-transparent'}
        `}
      >
        <Text
          className={`
            ${sizeClasses[size].text}
            ${!isRequester ? 'text-white' : 'text-gray-600'}
          `}
        >
          도움 제공
        </Text>
      </TouchableOpacity>
    </View>
  );
}
