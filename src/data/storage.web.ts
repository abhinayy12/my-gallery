import AsyncStorage from '@react-native-async-storage/async-storage';
import { GalleryItem } from './db';

// helper: convert Blob -> base64 string (no data: prefix)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.onload = () => {
      const result = reader.result as string; // "data:<mime>;base64,AAAA..."
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function saveImageAsync(sourceUri: string, id: string): Promise<string> {
  // Store as base64 in AsyncStorage for true persistence after refresh
  const res = await fetch(sourceUri);
  const blob = await res.blob();
  const base64 = await blobToBase64(blob);
  await AsyncStorage.setItem(`img_${id}`, base64);
  return `data:image/jpeg;base64,${base64}`;
}

export async function shareItem(item: GalleryItem) {
  if (navigator.share) {
    await navigator.share({ title: 'My Photo', text: item.caption, url: item.uri });
  } else {
    window.open(item.uri, '_blank');
  }
}