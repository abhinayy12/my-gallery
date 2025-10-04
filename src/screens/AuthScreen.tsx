import React, { useEffect } from 'react';
import { Button, View, StyleSheet, Image, Text, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { useAuth } from '../providers/AuthProvider';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen({ navigation }: any) {
  const { setUser, user } = useAuth();
  const extra: any = Constants.expoConfig?.extra || {};

  // EXACT redirect URI:
  // - On web, use whatever origin you're actually on (localhost, 127.0.0.1, LAN IP, custom port)
  // - On native, use the app scheme (make sure app.json has "scheme": "mygallery")
  const redirectUri =
    Platform.OS === 'web'
      ? window.location.origin // e.g., http://localhost:19006 or http://192.168.1.X:19006
      : makeRedirectUri({ scheme: 'mygallery' });

  if (Platform.OS === 'web') {
    console.log('Google redirectUri =', redirectUri);
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: extra.googleIosClientId,
    androidClientId: extra.googleAndroidClientId,
    webClientId: extra.googleWebClientId, // must be the Web Application client ID
    redirectUri,                           // <- IMPORTANT
    // scopes: ['openid', 'profile', 'email'], // defaults are fine; uncomment if you want
  });

  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (!authentication?.accessToken) return;
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          });
          const profile = await r.json();
          setUser({ id: profile.sub, name: profile.name, picture: profile.picture, email: profile.email });
          navigation.replace('Gallery');
        } catch (e) {
          console.warn('Failed to fetch userinfo', e);
        }
      }
    })();
  }, [response]);

  useEffect(() => {
    if (user) navigation.replace('Gallery');
  }, [user]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://i.imgur.com/9Q5f6RM.png' }} style={{ width: 72, height: 72, marginBottom: 12 }} />
      <Text style={styles.title}>My Gallery</Text>
      <Button title="Continue with Google" onPress={() => promptAsync()} disabled={!request} />
      {Platform.OS === 'web' && (
        <>
          <Text style={{ marginTop: 8, opacity: 0.7 }}>Tip: allow popups for localhost</Text>
          <Text style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>redirectUri: {redirectUri}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
});