export const SOUNDS = {
  JUMP: '/sounds/jump.wav',
  CRASH: '/sounds/crash.wav',
  LEVEL: '/sounds/levelup.mp3',
  BGM: '/sounds/bgm.mp3',
};

export type AudioKey = 'jump' | 'crash' | 'level';

export const createGameAudio = () => {
  const effects: Record<AudioKey, HTMLAudioElement> = {
    jump: new Audio(SOUNDS.JUMP),
    crash: new Audio(SOUNDS.CRASH),
    level: new Audio(SOUNDS.LEVEL),
  };

  Object.values(effects).forEach((audio) => {
    audio.volume = 0.4;
  });

  const bgm = new Audio(SOUNDS.BGM);
  bgm.loop = true;
  bgm.volume = 0.6;

  return {
    effects,
    bgm,
  };
};

export const playSound = (
  effects: Record<AudioKey, HTMLAudioElement>,
  key: AudioKey,
  muted: boolean
) => {
  if (muted) return;

  const audio = effects[key];
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {});
};

export const playBgm = (
  bgm: HTMLAudioElement | null,
  muted: boolean
) => {
  if (!bgm || muted) return;

  bgm.play().catch(() => {});
};

export const stopBgm = (
  bgm: HTMLAudioElement | null,
  reset: boolean = false
) => {
  if (!bgm) return;

  bgm.pause();

  if (reset) {
    bgm.currentTime = 0;
  }
};
