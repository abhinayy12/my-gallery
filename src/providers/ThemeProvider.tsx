import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme as NavDark, DefaultTheme as NavLight, Theme as NavTheme } from '@react-navigation/native';

type ThemeMode = 'system' | 'light' | 'dark';

type Ctx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolved: Exclude<ColorSchemeName, null>;
  navTheme: NavTheme;
};

const ThemeCtx = createContext<Ctx>({
  mode: 'system',
  setMode: () => {},
  resolved: 'light',
  navTheme: NavLight,
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const system = useColorScheme() ?? 'light';
  const [mode, setMode] = useState<ThemeMode>('system');

  // load stored preference
  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setMode(v);
    });
  }, []);

  // persist on change
  useEffect(() => {
    AsyncStorage.setItem('themeMode', mode);
  }, [mode]);

  const resolved: 'light' | 'dark' =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const navTheme = resolved === 'dark' ? NavDark : NavLight;

  const value = useMemo(
    () => ({ mode, setMode, resolved, navTheme }),
    [mode, resolved, navTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useThemeMode = () => useContext(ThemeCtx);