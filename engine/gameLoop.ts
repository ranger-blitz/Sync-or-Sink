export const startGameLoop = (update: (timestamp: number) => void) => {
  let rafId = 0;

  const tick = (timestamp: number) => {
    update(timestamp);
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
};

export const stopGameLoop = (stop: (() => void) | undefined) => {
  stop?.();
};
