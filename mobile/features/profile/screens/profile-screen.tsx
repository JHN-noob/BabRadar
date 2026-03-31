import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function ProfileScreen() {
  return (
    <ScreenShell
      eyebrow="Profile"
      title="마이페이지"
      description="로그인 상태, 기본 사용자 정보, 즐겨찾기 진입을 담는 최소 구조입니다.">
      <SectionCard title="MVP 범위" description="프로필은 과하게 확장하지 않고 핵심 정보만 먼저 노출합니다.">
        <View style={styles.list}>
          <ThemedText>- 로그인 상태</ThemedText>
          <ThemedText>- 이메일 또는 사용자 식별자</ThemedText>
          <ThemedText>- 즐겨찾기 화면 진입</ThemedText>
          <ThemedText>- 추천 기록은 이후 단계에서 검토</ThemedText>
        </View>
      </SectionCard>

      <SectionCard title="인증 진입" description="이 화면은 인증 상태에 따라 로그인 또는 프로필 정보로 분기될 예정입니다.">
        <Link href="/auth/sign-up" asChild>
          <Pressable style={styles.actionCard}>
            <ThemedText type="defaultSemiBold">회원가입 화면 열기</ThemedText>
            <ThemedText>이메일 기반 인증 흐름의 첫 진입점을 준비합니다.</ThemedText>
          </Pressable>
        </Link>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#EEE5D3',
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
});
