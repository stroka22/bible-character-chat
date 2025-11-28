import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;

// Prefer runtime env in dev client, fall back to app.json extra
const RUNTIME_API = process.env.EXPO_PUBLIC_API_BASE_URL || '';
const API_BASE = (RUNTIME_API || (extra?.apiBaseUrl as string) || '') as string;

export async function generateCharacterResponse(
  characterName: string,
  characterPersona: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const base = (API_BASE || '').replace(/\/$/, '');
  if (!base) throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  const res = await fetch(`${base}/api/openai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterName, characterPersona, messages })
  });
  if (!res.ok) throw new Error(`Proxy error ${res.status}`);
  const data = await res.json();
  return data?.text ?? '';
}
