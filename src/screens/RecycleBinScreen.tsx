import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, Image, useWindowDimensions, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { GalleryItem } from '../data/db';
import { getDeletedItems, restoreItem, deletePermanently } from '../data/db';

export default function RecycleBinScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const { width } = useWindowDimensions();
  const columns = Math.max(2, Math.floor(width / 140));

  const refresh = async () => {
    if (!user) return;
    setItems(await getDeletedItems(user.id));
  };

  useFocusEffect(useCallback(() => { refresh(); }, [user]));

  async function handlePermanentDelete(id: string) {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('Delete permanently? This cannot be undone.');
      if (!ok) return;
      await deletePermanently(id);
      refresh();
      return;
    }
    Alert.alert('Delete permanently?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePermanently(id); refresh(); } },
    ]);
  }

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ opacity: 0.7 }}>Recycle Bin is empty</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      key={columns}
      numColumns={columns}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding: 8 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.uri }} style={styles.img} />
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={async () => { await restoreItem(item.id); refresh(); }}>
              <Text>Restore</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.destructive]} onPress={() => handlePermanentDelete(item.id)}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { flex: 1, margin: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden', backgroundColor: 'white' },
  img: { width: '100%', aspectRatio: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, gap: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f6f6f6' },
  destructive: { borderColor: '#ffb3b3', backgroundColor: '#ffecec' },
});
