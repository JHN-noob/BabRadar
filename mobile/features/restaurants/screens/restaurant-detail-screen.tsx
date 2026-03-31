import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const requiredFields = [
  '이름',
  '카테고리',
  '지번 주소 또는 도로명 주소',
  '전화번호가 있으면 노출',
  '외부 place URL이 있으면 링크 노출',
  '즐겨찾기 버튼',
];

export function RestaurantDetailScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();

  return (
    <ScreenShell
      eyebrow="Restaurant"
      title="음식점 상세"
      description="상세 화면은 실제 응답 필드만 보여주는 방향으로 고정합니다.">
      <SectionCard title="현재 선택 상태" description="라우트 파라미터를 기준으로 상세 조회를 이어붙일 수 있는 상태입니다.">
        <ThemedView lightColor="#FFFFFF" darkColor="#243036" style={styles.stateCard}>
          <ThemedText type="defaultSemiBold">restaurantId</ThemedText>
          <ThemedText>{restaurantId ?? 'unknown'}</ThemedText>
        </ThemedView>
      </SectionCard>

      <SectionCard title="MVP 필수 필드" description="지원하지 않는 메타데이터는 보여주지 않는 규칙을 따릅니다.">
        <View style={styles.fieldList}>
          {requiredFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <ThemedView lightColor="#DCEFE9" darkColor="#29433E" style={styles.dot} />
              <ThemedText style={styles.fieldText}>{field}</ThemedText>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="다음 연결" description="상세에서 로그인 또는 즐겨찾기 작업으로 자연스럽게 이어지게 구성합니다.">
        <Link href="/auth/sign-in" asChild>
          <Pressable style={styles.actionCard}>
            <ThemedText type="defaultSemiBold">로그인 화면 열기</ThemedText>
            <ThemedText>로그인 이후 즐겨찾기 버튼을 실제 동작으로 연결합니다.</ThemedText>
          </Pressable>
        </Link>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  fieldList: {
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 7,
  },
  fieldText: {
    flex: 1,
  },
  actionCard: {
    backgroundColor: '#DDEAF5',
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
});
