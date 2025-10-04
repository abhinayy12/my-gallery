import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { GalleryItem } from './db';

export async function saveImageAsync(sourceUri: string, id: string): Promise<string> {
  try {
    const dir = (FileSystem as any).documentDirectory as string | null | undefined;
    if (!dir) return sourceUri;
    const dest = dir + `${id}.jpg`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
  } catch (e) {
    console.warn('saveImageAsync failed, fallback to original uri', e);
    return sourceUri;
  }
}

export async function shareItem(item: GalleryItem) {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(item.uri, { dialogTitle: item.caption || 'Share Image' });
    } else {
      await Share.share({ message: item.caption, url: item.uri });
    }
  } catch (e) {
    console.error('share failed', e);
  }
}