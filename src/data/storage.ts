import { Platform } from 'react-native';
import * as WebImpl from './storage.web';
import * as NativeImpl from './storage.native';

export const saveImageAsync =
  Platform.OS === 'web' ? WebImpl.saveImageAsync : NativeImpl.saveImageAsync;

export const shareItem =
  Platform.OS === 'web' ? WebImpl.shareItem : NativeImpl.shareItem;