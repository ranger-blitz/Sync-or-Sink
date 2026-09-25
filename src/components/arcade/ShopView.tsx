import type { FC } from 'react';
import { useState } from 'react';
import { getLocalProfile } from '../../lib/profiles/localProfile';
import { getLocalLoadout } from '../../lib/profiles/loadout';
import { getOwnedItemIds } from '../../lib/profiles/inventory';
import { SHOP_ITEMS, equipItem, purchaseItem } from '../../lib/rewards/shop';
import type { ShopItem } from '../../lib/rewards/shop';

export const ShopView: FC = () => {
  const [profile, setProfile] = useState(getLocalProfile);
  const [ownedIds, setOwnedIds] = useState(getOwnedItemIds);
  const [loadout, setLoadout] = useState(getLocalLoadout);
  const [message, setMessage] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    const result = purchaseItem(item.id);

    if (result.ok) {
      setProfile(result.profile);
      setOwnedIds(getOwnedItemIds());
      setMessage(`Bought ${item.name}`);
      return;
    }

    setMessage(
      result.reason === 'not-enough-coins'
        ? 'Not enough coins'
        : result.reason === 'already-owned'
          ? 'Already owned'
          : 'Item not found'
    );
  };

  const handleEquip = (item: ShopItem) => {
    const next = equipItem(item.id);
    if (next) {
      setLoadout(next);
      setMessage(`Equipped ${item.name}`);
    }
  };

  return (
    <div className="flex flex-col h-full items-center p-8 text-center bg-black space-y-4 overflow-y-auto">
      <span className="text-4xl mb-4">🛒</span>
      <h2 className="text-xl font-bold mb-2">ESCAPE POD SHOP</h2>
      <p className="text-xs font-bold text-yellow-300">{profile.coins} COINS</p>
      <p className="h-4 text-[10px] text-gray-400">{message ?? ''}</p>

      <div className="space-y-2 w-full max-w-[280px]">
        {SHOP_ITEMS.map((item) => {
          const owned = ownedIds.includes(item.id);
          const equipped = owned && Object.values(loadout).includes(item.id);
          const canAfford = profile.coins >= item.price;

          return (
            <div
              key={item.id}
              className="bg-white/5 border border-gray-700 p-3 rounded flex justify-between items-center"
            >
              <span className={`text-xs ${owned ? 'text-white' : 'text-gray-500'}`}>
                {owned ? '✅' : '🔒'} {item.name}
              </span>

              {!owned && (
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford}
                  className="text-[10px] font-black text-black bg-white px-3 py-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {item.price}
                </button>
              )}

              {owned && !equipped && (
                <button
                  onClick={() => handleEquip(item)}
                  className="text-[10px] font-bold text-white border border-white/20 px-3 py-1 rounded-full"
                >
                  EQUIP
                </button>
              )}

              {equipped && <span className="text-[10px] font-bold text-emerald-400">EQUIPPED</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};