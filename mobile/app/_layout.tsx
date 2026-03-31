import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="restaurant/[restaurantId]"
          options={{ title: '음식점 상세', headerBackTitle: '뒤로' }}
        />
        <Stack.Screen
          name="auth/sign-in"
          options={{ title: '로그인', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/sign-up"
          options={{ title: '회원가입', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
