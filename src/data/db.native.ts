import * as SQLite from 'expo-sqlite';

export type GalleryItem = {
  id: string;
  uri: string;
  caption: string;
  createdAt: number;
  userId: string;
};

let db: SQLite.SQLiteDatabase | null = null;

async function getDb() {
  if (!db) db = await SQLite.openDatabaseAsync('gallery.db');
  await db.execAsync(`CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY NOT NULL,
    uri TEXT NOT NULL,
    caption TEXT DEFAULT '',
    createdAt INTEGER NOT NULL,
    userId TEXT NOT NULL
  );`);
  return db;
}

export async function insertItem(item: GalleryItem) {
  const d = await getDb();
  await d.runAsync(
    'INSERT OR REPLACE INTO items (id, uri, caption, createdAt, userId) VALUES (?,?,?,?,?)',
    [item.id, item.uri, item.caption ?? '', item.createdAt, item.userId]
  );
}

export async function updateCaption(id: string, caption: string) {
  const d = await getDb();
  await d.runAsync('UPDATE items SET caption = ? WHERE id = ?', [caption, id]);
}

export async function getAllItems(userId: string): Promise<GalleryItem[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<GalleryItem>(
    'SELECT * FROM items WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
  return rows;
}

export async function getItem(id: string): Promise<GalleryItem | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<GalleryItem>('SELECT * FROM items WHERE id = ?', [id]);
  return row ?? null;
}