import { Link } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';

export function SignInScreen() {
  return (
    <ScreenShell
      eyebrow="Auth"
      title="이메일 로그인"
      description="Supabase 연결 전 단계의 인증 화면 골격입니다. 실제 인증 로직은 다음 단계에서 붙입니다.">
      <SectionCard title="입력 필드" description="이메일/비밀번호 기반 MVP 로그인 구조를 먼저 고정합니다.">
        <View style={styles.form}>
          <TextInput placeholder="이메일" placeholderTextColor="#7C8894" style={styles.input} />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#7C8894"
            secureTextEntry
            style={styles.input}
          />
          <Pressable style={styles.primaryButton}>
            <ThemedText type="defaultSemiBold">로그인 버튼 자리</ThemedText>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="다음 연결" description="인증 연결 후 즐겨찾기/마이페이지와 세션 복원 흐름을 붙입니다.">
        <Link href="/auth/sign-up" asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">회원가입 화면으로 이동</ThemedText>
          </Pressable>
        </Link>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7DEE4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#DCEFE9',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButton: {
    backgroundColor: '#EEF1F4',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
});
