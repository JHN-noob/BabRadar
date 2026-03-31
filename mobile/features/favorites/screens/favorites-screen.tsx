import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const favoriteRules = [
  '로그인 사용자만 저장 가능',
  'MVP 범위는 저장, 삭제, 목록 조회까지만',
  '리스트와 상세 화면의 상태를 함께 갱신',
];

export function FavoritesScreen() {
  return (
    <ScreenShell
      eyebrow="Favorites"
      title="즐겨찾기"
      description="Supabase 연결 전까지는 저장 규칙과 화면 구조를 먼저 고정하는 단계입니다.">
      <SectionCard title="저장 규칙" description="과도한 분류 기능 없이 기본 저장 경험만 먼저 구현합니다.">
        {favoriteRules.map((rule) => (
          <View key={rule} style={styles.ruleRow}>
            <ThemedView lightColor="#D9EBF7" darkColor="#273844" style={styles.marker} />
            <ThemedText style={styles.ruleText}>{rule}</ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="로그인 선행 작업" description="인증이 준비되면 이 화면에서 사용자별 저장 목록을 보여주면 됩니다.">
        <Link href="/auth/sign-in" asChild>
          <Pressable style={styles.actionCard}>
            <ThemedText type="defaultSemiBold">이메일 로그인 화면으로 이동</ThemedText>
            <ThemedText>즐겨찾기 저장 전 세션 확보 흐름을 먼저 확인합니다.</ThemedText>
          </Pressable>
        </Link>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 7,
  },
  ruleText: {
    flex: 1,
  },
  actionCard: {
    backgroundColor: '#DDEAF5',
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
});
