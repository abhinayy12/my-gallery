import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSpeech } from '../hooks/useSpeech';

export default function VoiceCaptionBar({
  onTranscript,
}: {
  onTranscript: (t: string) => void;
}) {
  const { supported, listening, start, stop } = useSpeech(onTranscript);

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, !supported && styles.disabled]}
        onPress={start}
        disabled={!supported || listening}
      >
        <Text>{listening ? 'Listening…' : '🎙️ Start'}</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, !supported && styles.disabled]}
        onPress={stop}
        disabled={!supported || !listening}
      >
        <Text>⏹ Stop</Text>
      </Pressable>

      {!supported && (
        <Text style={{ opacity: 0.6, marginLeft: 6 }}>
          Voice not supported here — use keyboard
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
  disabled: { opacity: 0.5 },
});