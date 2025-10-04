import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeMode } from '../providers/ThemeProvider';

function Option({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.opt, active && styles.optActive]}>
      <Text style={{ fontWeight: active ? '700' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { mode, setMode, resolved } = useThemeMode();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Appearance</Text>
      <Text style={{ opacity: 0.7, marginBottom: 8 }}>Current: {resolved}</Text>
      <View style={styles.row}>
        <Option label="System" active={mode === 'system'} onPress={() => setMode('system')} />
        <Option label="Light" active={mode === 'light'} onPress={() => setMode('light')} />
        <Option label="Dark" active={mode === 'dark'} onPress={() => setMode('dark')} />
      </View>
      <Text style={{ opacity: 0.7, marginTop: 16 }}>
        Changes apply immediately. Your choice is saved for next time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  opt: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
  },
  optActive: {
    borderColor: '#1f6feb',
    backgroundColor: '#e9f1ff',
  },
});