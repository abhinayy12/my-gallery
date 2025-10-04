import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image, useWindowDimensions, Alert, TextInput } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllItems, GalleryItem, updateCaption } from '../data/db';
import ImageTile from '../components/ImageTile';

export default function GalleryScreen() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [query, setQuery] = useState('');
  const columns = Math.max(2, Math.floor(width / 140));

  const refresh = async () => {
    if (!user) return;
    const list = await getAllItems(user.id);
    setItems(list);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [user])
  );

  useEffect(() => {
    if (!user) {
      Alert.alert('Not signed in');
    }
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => (it.caption || '').toLowerCase().includes(q));
  }, [items, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user && <Image source={{ uri: user.picture }} style={styles.avatar} />}
        <Text style={styles.title}>{user ? `Hi, ${user.name}` : 'My Gallery'}</Text>
        <Pressable style={styles.iconBtn} onPress={() => nav.navigate('Settings')}>
          <Text style={styles.iconTxt}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search captions…"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          autoCorrect={false}
        />
        <Pressable style={styles.clearBtn} onPress={() => setQuery('')}>
          <Text>✕</Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ opacity: 0.7, marginBottom: 8 }}>
            {query ? 'No results for your search.' : 'No images yet.'}
          </Text>
          {!query && (
            <Pressable style={styles.primaryBtn} onPress={() => nav.navigate('Add')}>
              <Text style={styles.primaryTxt}>Add an image</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          key={columns}
          numColumns={columns}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <ImageTile
              item={item}
              onEditCaption={async (id, caption) => {
                await updateCaption(id, caption);
                refresh();
              }}
            />
          )}
          contentContainerStyle={{ padding: 8 }}
        />
      )}

      <Pressable style={styles.fab} onPress={() => nav.navigate('Add')}>
        <Text style={{ fontSize: 24 }}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  title: { fontSize: 18, fontWeight: '600', flex: 1 },
  iconBtn: { padding: 8 },
  iconTxt: { fontSize: 18 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 6 },
  search: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  clearBtn: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: '#1f6feb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  primaryTxt: { color: 'white', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#eaeaea',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});