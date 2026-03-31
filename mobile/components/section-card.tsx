import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({ title, description, children, style }: SectionCardProps) {
  return (
    <ThemedView lightColor="#F3F7F6" darkColor="#1D2427" style={[styles.card, style]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {description ? <ThemedText style={styles.description}>{description}</ThemedText> : null}
      <ThemedView lightColor="#F3F7F6" darkColor="#1D2427" style={styles.content}>
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  description: {
    color: '#61707C',
  },
  content: {
    gap: 12,
  },
});
