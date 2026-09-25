const STORAGE_KEY = 'arcade-inventory';

export const getOwnedItemIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const saveOwnedItemIds = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};
