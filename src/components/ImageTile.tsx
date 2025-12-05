import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Pressable, TextInput, Platform, Alert } from 'react-native';
import { GalleryItem } from '../data/db';
import VoiceCaptionBar from './VoiceCaptionBar';
import { shareItem } from '../data/storage';
import { markDeleted } from '../data/db';

export default function ImageTile({
  item,
  onEditCaption,
  onDeleted,
}: {
  item: GalleryItem;
  onEditCaption: (id: string, caption: string) => void;
  onDeleted?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption || '');

  async function onDeletePress() {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('Move to Recycle Bin?');
      if (!ok) return;
      await markDeleted(item.id);
      onDeleted?.();
      return;
    }
    Alert.alert('Delete photo', 'Move to Recycle Bin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await markDeleted(item.id);
          onDeleted?.();
        },
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.uri }} style={styles.img} />
      {editing ? (
        <View style={{ padding: 6 }}>
          <TextInput value={caption} onChangeText={setCaption} placeholder="Write a caption" style={styles.input} />
          <VoiceCaptionBar onTranscript={(t) => setCaption(t)} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <Pressable style={styles.smallBtn} onPress={() => { onEditCaption(item.id, caption); setEditing(false); }}>
              <Text>Save</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => { setCaption(item.caption || ''); setEditing(false); }}>
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onLongPress={() => setEditing(true)} style={{ padding: 6 }}>
          <Text numberOfLines={2} style={styles.caption}>{item.caption || 'Tap & hold to add caption'}</Text>
        </Pressable>
      )}
      <View style={{ position: 'absolute', right: 8, top: 8, flexDirection: 'row', gap: 6 }}>
        <Pressable style={styles.share} onPress={() => shareItem(item)}>
          <Text style={{ fontSize: 12 }}>{Platform.OS === 'web' ? 'Share / Open' : 'Share'}</Text>
        </Pressable>
        <Pressable style={styles.share} onPress={onDeletePress}>
          <Text style={{ fontSize: 12 }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', backgroundColor: 'white' },
  img: { width: '100%', aspectRatio: 1 },
  caption: { fontSize: 12, opacity: 0.8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8 },
  share: { backgroundColor: '#ffffffcc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
});