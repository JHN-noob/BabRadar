import { Link } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';

export function SignUpScreen() {
  return (
    <ScreenShell
      eyebrow="Auth"
      title="회원가입"
      description="이메일 기반 가입 흐름과 로그인 화면 왕복 경로를 먼저 고정해둔 상태입니다.">
      <SectionCard title="필수 입력" description="MVP에서는 이메일과 비밀번호만 먼저 받는 단순 구조로 갑니다.">
        <View style={styles.form}>
          <TextInput placeholder="이메일" placeholderTextColor="#7C8894" style={styles.input} />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#7C8894"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="비밀번호 확인"
            placeholderTextColor="#7C8894"
            secureTextEntry
            style={styles.input}
          />
          <Pressable style={styles.primaryButton}>
            <ThemedText type="defaultSemiBold">회원가입 버튼 자리</ThemedText>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="로그인으로 이동" description="가입 완료 후 즉시 세션 연결 여부를 확인할 수 있게 구성합니다.">
        <Link href="/auth/sign-in" asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">로그인 화면으로 이동</ThemedText>
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
    backgroundColor: '#EEE5D3',
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
