import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_CONSENT_KEY = '@faithtalkai_ai_consent';

export async function hasAIConsent(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AI_CONSENT_KEY);
    return value === 'granted';
  } catch {
    return false;
  }
}

export async function setAIConsent(granted: boolean): Promise<void> {
  try {
    if (granted) {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'granted');
    } else {
      await AsyncStorage.removeItem(AI_CONSENT_KEY);
    }
  } catch {}
}

export async function clearAIConsent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AI_CONSENT_KEY);
  } catch {}
}
