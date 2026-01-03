/**
 * 프로필 편집 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks';
import { Button, Card, Input } from '@/components/ui';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isUpdatingProfile } = useAuth();

  // 폼 상태
  const [name, setName] = useState(user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [introduction, setIntroduction] = useState(user?.introduction || '');
  const [gender, setGender] = useState<'male' | 'female'>(user?.gender || 'male');
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl);

  // 유효성 검사 에러
  const [errors, setErrors] = useState<{
    name?: string;
    nickname?: string;
    introduction?: string;
  }>({});

  // 이미지 피커 - 앨범에서 선택
  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 이미지 피커 - 카메라로 촬영
  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 프로필 이미지 변경
  const handleChangeImage = () => {
    Alert.alert('프로필 사진', '프로필 사진을 변경하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '카메라로 촬영',
        onPress: takePhotoWithCamera,
      },
      {
        text: '앨범에서 선택',
        onPress: pickImageFromLibrary,
      },
      {
        text: '기본 이미지로 변경',
        onPress: () => setProfileImage(undefined),
        style: 'destructive',
      },
    ]);
  };

  // 유효성 검사
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    }

    if (nickname && nickname.length > 10) {
      newErrors.nickname = '닉네임은 10자 이하로 입력해주세요';
    }

    if (introduction && introduction.length > 100) {
      newErrors.introduction = '소개는 100자 이하로 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장
  const handleSave = () => {
    if (!validate()) return;

    updateProfile(
      {
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        introduction: introduction.trim() || undefined,
        gender,
        profileImageUrl: profileImage,
      },
      {
        onSuccess: () => {
          Alert.alert('저장 완료', '프로필이 업데이트되었습니다.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        },
        onError: () => {
          Alert.alert('오류', '프로필 저장에 실패했습니다.');
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '프로필 편집',
          headerBackTitle: '취소',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 프로필 이미지 */}
        <View className="items-center py-8">
          <TouchableOpacity onPress={handleChangeImage}>
            <View className="relative">
              <View className="w-28 h-28 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="w-28 h-28"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-5xl">👤</Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white">📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-3">
            탭하여 프로필 사진 변경
          </Text>
        </View>

        {/* 기본 정보 */}
        <View className="px-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            기본 정보
          </Text>

          <Card variant="outlined" padding="lg" className="space-y-5">
            {/* 이름 */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">이름 *</Text>
              <TextInput
                className={`bg-gray-50 rounded-xl px-4 py-3 text-base ${
                  errors.name ? 'border border-red-500' : ''
                }`}
                value={name}
                onChangeText={setName}
                placeholder="이름을 입력하세요"
                placeholderTextColor="#9CA3AF"
                maxLength={20}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* 닉네임 */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">닉네임 (선택)</Text>
              <TextInput
                className={`bg-gray-50 rounded-xl px-4 py-3 text-base ${
                  errors.nickname ? 'border border-red-500' : ''
                }`}
                value={nickname}
                onChangeText={setNickname}
                placeholder="이웃에게 보여질 이름"
                placeholderTextColor="#9CA3AF"
                maxLength={10}
              />
              {errors.nickname && (
                <Text className="text-red-500 text-sm mt-1">{errors.nickname}</Text>
              )}
              <Text className="text-gray-400 text-xs mt-1">
                {nickname.length}/10
              </Text>
            </View>

            {/* 성별 */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">성별</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setGender('male')}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    gender === 'male'
                      ? 'bg-primary-100 border-primary-500'
                      : 'border-gray-200'
                  }`}
                >
                  <Text className="text-2xl mb-1">👨</Text>
                  <Text
                    className={
                      gender === 'male' ? 'text-primary-700' : 'text-gray-700'
                    }
                  >
                    남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGender('female')}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    gender === 'female'
                      ? 'bg-primary-100 border-primary-500'
                      : 'border-gray-200'
                  }`}
                >
                  <Text className="text-2xl mb-1">👩</Text>
                  <Text
                    className={
                      gender === 'female' ? 'text-primary-700' : 'text-gray-700'
                    }
                  >
                    여성
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* 자기소개 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            자기소개
          </Text>

          <Card variant="outlined" padding="lg">
            <TextInput
              className={`bg-gray-50 rounded-xl px-4 py-3 text-base min-h-[100px] ${
                errors.introduction ? 'border border-red-500' : ''
              }`}
              value={introduction}
              onChangeText={setIntroduction}
              placeholder="간단한 자기소개를 작성해주세요"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={100}
            />
            {errors.introduction && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.introduction}
              </Text>
            )}
            <Text className="text-gray-400 text-xs mt-2 text-right">
              {introduction.length}/100
            </Text>
          </Card>
        </View>

        {/* 연락처 정보 (읽기 전용) */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            연락처
          </Text>

          <Card variant="outlined" padding="lg">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">전화번호</Text>
              <Text className="text-gray-900">{user?.phone || '-'}</Text>
            </View>
            <Text className="text-gray-400 text-xs mt-2">
              전화번호 변경은 고객센터로 문의해주세요
            </Text>
          </Card>
        </View>

        {/* 주소 정보 */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            주소
          </Text>

          <Card variant="outlined" padding="lg">
            <TouchableOpacity
              className="flex-row justify-between items-center"
              onPress={() => router.push('/location/select')}
            >
              <View>
                <Text className="text-gray-900">
                  {user?.address
                    ? `${user.address.sigungu} ${user.address.dong}`
                    : '주소를 설정해주세요'}
                </Text>
                {user?.address?.detail && (
                  <Text className="text-gray-500 text-sm mt-1">
                    {user.address.detail}
                  </Text>
                )}
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          title="저장"
          fullWidth
          size="lg"
          loading={isUpdatingProfile}
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
}
