import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Fonts } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ScreenShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ScreenShell({ eyebrow, title, description, children }: ScreenShellProps) {
  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#2F6F5E',
    fontFamily: Fonts.mono,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    lineHeight: 38,
  },
  description: {
    color: '#5F6B76',
  },
  body: {
    gap: 16,
  },
});
