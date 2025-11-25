import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;

const API_BASE = (extra?.apiBaseUrl as string) || '';

export async function generateCharacterResponse(
  characterName: string,
  characterPersona: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const base = API_BASE.replace(/\/$/, '');
  if (!base) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL in app config');
  }
  const res = await fetch(`${base}/api/openai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterName, characterPersona, messages })
  });
  if (!res.ok) throw new Error(`Proxy error ${res.status}`);
  const data = await res.json();
  return data?.text ?? '';
}
