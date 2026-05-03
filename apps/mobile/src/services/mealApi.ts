const STORAGE_BASE = '@personal_trainer/api_base_url';
const STORAGE_KEY = '@personal_trainer/api_key';

export async function getStoredApiConfig(getItem: (k: string) => Promise<string | null>): Promise<{
  baseUrl: string;
  apiKey: string;
}> {
  const baseUrl = (await getItem(STORAGE_BASE))?.trim() ?? '';
  const apiKey = (await getItem(STORAGE_KEY))?.trim() ?? '';
  return { baseUrl, apiKey };
}

export async function saveApiConfig(
  setItem: (k: string, v: string) => Promise<void>,
  baseUrl: string,
  apiKey: string
): Promise<void> {
  await setItem(STORAGE_BASE, baseUrl.trim().replace(/\/$/, ''));
  await setItem(STORAGE_KEY, apiKey.trim());
}

export type DietDayPayload = {
  date: string;
  caloriesConsumed: number;
  caloriesHistory?: Record<string, number>;
};

export async function pushDietDay(
  baseUrl: string,
  apiKey: string,
  body: DietDayPayload
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!baseUrl || !apiKey) return { ok: true, status: 0 };
  const url = `${baseUrl}/api/v1/diet/day`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, status: res.status, error: t.slice(0, 200) };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, error: msg };
  }
}
