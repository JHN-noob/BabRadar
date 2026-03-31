import { StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const recommendationPrinciples = [
  '실제 조회된 후보군만 추천 입력으로 사용',
  '1인 식사 적합성과 거리 기준을 우선 적용',
  '근거 없는 평점, 분위기, 대기시간 추정은 금지',
];

export function RecommendationScreen() {
  return (
    <ScreenShell
      eyebrow="Recommendation"
      title="추천"
      description="추천 결과는 OpenAI가 생성하되, 실제 Kakao 후보 데이터만 근거로 사용해야 합니다.">
      <SectionCard title="추천 원칙" description="프롬프트 설계보다 먼저 데이터 경계를 명확하게 고정합니다.">
        {recommendationPrinciples.map((principle) => (
          <View key={principle} style={styles.row}>
            <ThemedView lightColor="#F3E8D2" darkColor="#4A3F2B" style={styles.badge} />
            <ThemedText style={styles.rowText}>{principle}</ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="예정 응답 형식" description="서버 라우트를 만들 때 아래 구조를 기준으로 응답 형태를 잡으면 됩니다.">
        <ThemedView lightColor="#FFFDF8" darkColor="#2C2922" style={styles.codeCard}>
          <ThemedText type="defaultSemiBold">추천 결과</ThemedText>
          <ThemedText>- 추천 순위</ThemedText>
          <ThemedText>- 음식점 이름</ThemedText>
          <ThemedText>- 짧은 추천 이유</ThemedText>
          <ThemedText>- 사용한 실제 후보 ID</ThemedText>
        </ThemedView>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 7,
  },
  rowText: {
    flex: 1,
  },
  codeCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
});
