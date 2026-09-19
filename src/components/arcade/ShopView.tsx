import type { FC } from 'react';

export const ShopView: FC = () => (
  <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-black space-y-4">
    <span className="text-4xl mb-4">🛒</span>
    <h2 className="text-xl font-bold mb-2">ESCAPE POD SHOP</h2>
    <div className="space-y-2 w-full max-w-[280px]">
      <div className="bg-white/5 border border-gray-700 p-3 rounded flex justify-between items-center"><span className="text-xs text-gray-500">🔒 NEON TRAIL</span><span className="text-[10px] text-gray-600">Reach 500m</span></div>
      <div className="bg-white/5 border border-gray-700 p-3 rounded flex justify-between items-center"><span className="text-xs text-gray-500">🔒 TURBO BOOSTERS</span><span className="text-[10px] text-gray-600">Reach 1000m</span></div>
    </div>
  </div>
);
