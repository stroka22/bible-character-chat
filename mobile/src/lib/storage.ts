// Safe storage wrapper that prefers AsyncStorage and falls back to SecureStore
import type { } from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

let AsyncStorage: any = null;
try {
  // lazy require to avoid crashing when native module is missing in dev client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

async function tryAsyncStorage<T>(op: () => Promise<T>): Promise<T | undefined> {
  if (!AsyncStorage) return undefined;
  try { return await op(); } catch { return undefined; }
}

export async function getItem(key: string): Promise<string | null> {
  const a = await tryAsyncStorage(() => AsyncStorage.getItem(key));
  if (a !== undefined) return a as any;
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}

export async function setItem(key: string, value: string): Promise<void> {
  const ok = await tryAsyncStorage(() => AsyncStorage.setItem(key, value));
  if (ok !== undefined) return;
  try { await SecureStore.setItemAsync(key, value); } catch {}
}

export async function removeItem(key: string): Promise<void> {
  const ok = await tryAsyncStorage(() => AsyncStorage.removeItem(key));
  if (ok !== undefined) return;
  try { await SecureStore.deleteItemAsync(key); } catch {}
}
