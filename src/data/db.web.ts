import AsyncStorage from '@react-native-async-storage/async-storage';

export type GalleryItem = {
  id: string;
  uri: string;
  caption: string;
  createdAt: number;
  userId: string;
};

// We store per-user arrays and a global index id->userId
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
  // update per-user list
  const raw = await AsyncStorage.getItem(LIST_KEY(item.userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const existingIndex = list.findIndex((x) => x.id === item.id);
  if (existingIndex >= 0) list[existingIndex] = item;
  else list.unshift(item); // newest first
  await AsyncStorage.setItem(LIST_KEY(item.userId), JSON.stringify(list));

  // update global id->userId index
  const idx = await getIndex();
  idx[item.id] = item.userId;
  await setIndex(idx);
}

export async function updateCaption(id: string, caption: string) {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return; // nothing to do

  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) {
    list[i] = { ...list[i], caption };
    await AsyncStorage.setItem(LIST_KEY(userId), JSON.stringify(list));
  }
}

export async function getAllItems(userId: string): Promise<GalleryItem[]> {
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  // ensure newest first
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export async function getItem(id: string): Promise<GalleryItem | null> {
  const idx = await getIndex();
  const userId = idx[id];
  if (!userId) return null;
  const raw = await AsyncStorage.getItem(LIST_KEY(userId));
  const list: GalleryItem[] = raw ? JSON.parse(raw) : [];
  return list.find((x) => x.id === id) ?? null;
}