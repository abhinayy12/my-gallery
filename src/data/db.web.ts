import AsyncStorage from '@react-native-async-storage/async-storage';

export type GalleryItem = {
  id: string;
  uri: string;
  caption: string;
  createdAt: number;
  userId: string;
  deletedAt?: number | null;
};

const LIST_KEY = (userId: string) => `gallery_items_${userId}`;
const INDEX_KEY = 'gallery_index';

async function getIndex(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
}
async function setIndex(idx: Record<string, string>) {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(idx));
}

export async function insertItem(item: GalleryItem) {
  const raw = await AsyncStorage.getItem(LIST_KEY(item.userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const existingIndex = list.findIndex((x) => x.id === item.id);
  if (existingIndex >= 0) list[existingIndex] = item;
  else list.unshift(item);
  await AsyncStorage.setItem(LIST_KEY(item.userId), JSON.stringify(list));
  const idx = await getIndex();
  idx[item.id] = item.userId;
  await setIndex(idx);
}

export async function updateCaption(id: string, caption: string) {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) {
    list[i] = { ...list[i], caption };
    await AsyncStorage.setItem(LIST_KEY(userId), JSON.stringify(list));
  }
}

export async function markDeleted(id: string) {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) {
    list[i] = { ...list[i], deletedAt: Date.now() };
    await AsyncStorage.setItem(LIST_KEY(userId), JSON.stringify(list));
  }
}

export async function restoreItem(id: string) {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) {
    list[i] = { ...list[i], deletedAt: null };
    await AsyncStorage.setItem(LIST_KEY(userId), JSON.stringify(list));
  }
}

export async function deletePermanently(id: string) {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const next = list.filter((x) => x.id !== id);
  await AsyncStorage.setItem(LIST_KEY(userId), JSON.stringify(next));
  const nextIdx = { ...idx };
  delete nextIdx[id];
  await setIndex(nextIdx);
}

export async function getAllItems(userId: string): Promise<GalleryItem[]> {
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const filtered = list.filter((x) => !x.deletedAt);
  filtered.sort((a, b) => b.createdAt - a.createdAt);
  return filtered;
}

export async function getDeletedItems(userId: string): Promise<GalleryItem[]> {
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const filtered = list.filter((x) => x.deletedAt);
  filtered.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  return filtered;
}

export async function getItem(id: string): Promise<GalleryItem | null> {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return null;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  return list.find((x) => x.id === id) ?? null;
}