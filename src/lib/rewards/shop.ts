import type { PlayerProfile } from '../profiles/types';
import type { PlayerLoadout } from '../profiles/loadout';
import { getLocalProfile, saveLocalProfile } from '../profiles/localProfile';
import { getLocalLoadout, saveLocalLoadout } from '../profiles/loadout';
import { getOwnedItemIds, saveOwnedItemIds } from '../profiles/inventory';

export type ShopItemType = 'skin' | 'trail' | 'effect' | 'badge';

export type ShopItem = {
  id: string;
  name: string;
  type: ShopItemType;
  price: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'trail-neon', name: 'NEON TRAIL', type: 'trail', price: 60 },
  { id: 'effect-turbo', name: 'TURBO BOOSTERS', type: 'effect', price: 100 }, // visual only
  { id: 'skin-ember', name: 'EMBER CORE', type: 'skin', price: 40 },
  { id: 'skin-frost', name: 'FROST CORE', type: 'skin', price: 40 },
  { id: 'badge-pioneer', name: 'PIONEER BADGE', type: 'badge', price: 25 },
];

export type PurchaseResult =
  | { ok: true; profile: PlayerProfile }
  | { ok: false; reason: 'not-found' | 'already-owned' | 'not-enough-coins' };

export const purchaseItem = (itemId: string): PurchaseResult => {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return { ok: false, reason: 'not-found' };

  const owned = getOwnedItemIds();
  if (owned.includes(itemId)) return { ok: false, reason: 'already-owned' };

  const profile = getLocalProfile();
  if (profile.coins < item.price) return { ok: false, reason: 'not-enough-coins' };

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: profile.coins - item.price,
  };

  saveLocalProfile(updatedProfile);
  saveOwnedItemIds([...owned, itemId]);

  return { ok: true, profile: updatedProfile };
};

const LOADOUT_KEY_BY_TYPE: Record<ShopItemType, keyof PlayerLoadout> = {
  skin: 'skinId',
  trail: 'trailId',
  effect: 'effectId',
  badge: 'badgeId',
};

/** Returns the new loadout, or null if the item does not exist or is not owned. */
export const equipItem = (itemId: string): PlayerLoadout | null => {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || !getOwnedItemIds().includes(itemId)) return null;

  const nextLoadout: PlayerLoadout = {
    ...getLocalLoadout(),
    [LOADOUT_KEY_BY_TYPE[item.type]]: itemId,
  };

  saveLocalLoadout(nextLoadout);
  return nextLoadout;
};
