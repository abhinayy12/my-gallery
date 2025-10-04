import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import { useAuth } from '../providers/AuthProvider';
import { saveImageAsync } from '../data/storage';
import { insertItem } from '../data/db';
import { useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';

export default function AddScreen() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [busy, setBusy] = useState(false);

  async function pick(from: 'camera' | 'library') {
    try {
      if (!user) return;
      setBusy(true);

      console.log('[AddScreen] Platform:', Platform.OS, 'isDevice:', Device.isDevice, 'request:', from);

      let res: ImagePicker.ImagePickerResult;

      if (from === 'camera') {
        // Web: no real camera via ImagePicker → fall back
        if (Platform.OS === 'web') {
          Alert.alert('Camera not available on web', 'Opening your photo library instead.');
          res = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: false,
          });
        }
        // Simulators/Emulators: no camera → fall back
        else if (!Device.isDevice) {
          Alert.alert('Camera not available in simulator', 'Use a physical device. Opening library instead.');
          const permLib = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permLib.granted) { Alert.alert('Library permission denied'); return; }
          res = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: false,
          });
        }
        // Physical device: try real camera, fallback if it throws
        else {
          const permCam = await ImagePicker.requestCameraPermissionsAsync();
          if (!permCam.granted) { Alert.alert('Camera permission denied'); return; }

          try {
            res = await ImagePicker.launchCameraAsync({
              quality: 0.8,
              cameraType: ImagePicker.CameraType.back,
              allowsEditing: false,
            });
          } catch (err: any) {
            console.warn('[AddScreen] launchCameraAsync error:', err?.message || err);
            Alert.alert('Camera unavailable', 'Opening your photo library instead.');
            const permLib = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permLib.granted) { Alert.alert('Library permission denied'); return; }
            res = await ImagePicker.launchImageLibraryAsync({
              quality: 0.8,
              allowsEditing: false,
            });
          }
        }
      } else {
        // Library path (all platforms)
        const permLib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permLib.granted) { Alert.alert('Library permission denied'); return; }
        res = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: false,
        });
      }

      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        asset.uri + Date.now()
      );

      const storedUri = await saveImageAsync(asset.uri, id);
      await insertItem({
        id,
        uri: storedUri,
        caption: '',
        createdAt: Date.now(),
        userId: user.id,
      });

      nav.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not add image');
    } finally {
      setBusy(false);
    }
  }

  const buttonHint =
    Platform.OS === 'web'
      ? 'Use Camera (will open Library on web)'
      : !Device.isDevice
      ? 'Use Camera (no camera in simulator; opens Library)'
      : 'Use Camera';

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.btn, busy && styles.disabled]}
        onPress={() => pick('camera')}
        disabled={busy}
      >
        <Text style={styles.btnTxt}>{buttonHint}</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, busy && styles.disabled]}
        onPress={() => pick('library')}
        disabled={busy}
      >
        <Text style={styles.btnTxt}>Pick from Library</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 16 },
  btn: { backgroundColor: '#1f6feb', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: 'white', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});