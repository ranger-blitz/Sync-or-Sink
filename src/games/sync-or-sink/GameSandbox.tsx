import { FC, useEffect, useState, useRef } from 'react';
import type { GameProps, GameResult } from '../types';
import { GAME_CONFIG } from '../../../engine/constants';
import type {
  Player,
  GameMode,
  GameState,
  Obstacle,
  Particle,
  BgProp,
  FloatingText,
} from '../../../engine/types';
import { ENVIRONMENTS } from '../../../engine/config';
import { SYNC_OR_SINK_ACHIEVEMENTS } from '../../../engine/achievements';
import {
  spawnExplosion,
  spawnDust,
  spawnText,
} from '../../../engine/particles';
import {
  createGameAudio,
  playSound,
  playBgm,
  stopBgm,
  type AudioKey,
} from '../../../engine/audio';
import {
  spawnBgProp,
  spawnBlock,
  spawnSpecial,
} from '../../../engine/spawning';
import {
  doJump as doJumpPlayer,
  releaseJump as releaseJumpPlayer,
  getPointerLane,
  handleLinkedJump,
} from '../../../engine/input';
import { resetPlayer } from '../../../engine/state';
import { renderGame } from '../../../engine/renderer';
import { startGameLoop, stopGameLoop } from '../../../engine/gameLoop';
import { checkAchievements, recordRun } from '../../../engine/achievementChecks';
import {
  updatePlayerPhysics,
} from '../../../engine/physics';
import { handleObstacleCollision } from '../../../engine/collision';

const {
  GOD_MODE,
  JUMP_FORCE,
  BASE_SPEED,
  SPAWN_RATE_BASE,
  PLAYER_SIZE,
  HITBOX_PADDING,
  JUMP_BUFFER_TIME,
  METERS_PER_LEVEL,
  PIXELS_TO_METERS,
  WIDTH,
  HEIGHT,
  FLOOR,
  MID,
  SPEED_MULTIPLIER,
} = GAME_CONFIG;

export const GameSandbox: FC<GameProps> = ({
  gameId,
  onGameStart,
  onScoreUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('LINKED');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentEnv, setCurrentEnv] = useState<(typeof ENVIRONMENTS)[number]>(ENVIRONMENTS[ENVIRONMENTS.length - 1]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [ghostTimeRemaining, setGhostTimeRemaining] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [showGuide, setShowGuide] = useState(false);
  const [username, setUsername] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [totalRuns, setTotalRuns] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);

  const gameStateRef = useRef<GameState>('START');
  const gameModeRef = useRef<GameMode>('LINKED');
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const distanceRef = useRef(0);
  const levelRef = useRef(0);
  const runStartedAtRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCount = useRef(0);
  const speedRef = useRef<number>(BASE_SPEED);
  const shakeRef = useRef(0);

  const shieldActive = useRef(false);
  const shieldTimer = useRef(0);
  const usedShieldRef = useRef(false);
  const ghostActive = useRef(false);
  const ghostTimer = useRef(0);
  const glitchActive = useRef(false);
  const glitchTimer = useRef(0);
  const audioCtx = useRef<Record<string, HTMLAudioElement>>({});
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const transitionProgress = useRef(1);
  const prevEnvIdx = useRef(0);
  const nextEnvIdx = useRef(0);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pLeft = useRef<Player>(resetPlayer(ENVIRONMENTS[0].accent));
  const pRight = useRef<Player>(resetPlayer('#fff'));
  const obstacles = useRef<Obstacle[]>([]);
  const particles = useRef<Particle[]>([]);
  const texts = useRef<FloatingText[]>([]);
  const bgProps = useRef<BgProp[]>([]);

  useEffect(() => {
    const savedScore = localStorage.getItem('syncOrSinkHigh');
    if (savedScore) {
      setHighScore(parseInt(savedScore));
      highScoreRef.current = parseInt(savedScore);
    }
    const savedRuns = localStorage.getItem('syncOrSinkRuns');
    if (savedRuns) setTotalRuns(parseInt(savedRuns));
    const savedName = localStorage.getItem('syncOrSinkName');
    if (savedName) {
      setUsername(savedName);
      setShowNameInput(false);
    }
    const savedBadges = localStorage.getItem('syncOrSinkBadges');
    if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));

    const gameAudio = createGameAudio();
    audioCtx.current = gameAudio.effects;
    bgmRef.current = gameAudio.bgm;

    const handlePauseTrigger = () => {
      if (gameStateRef.current === 'PLAYING') {
        gameStateRef.current = 'PAUSED';
        setGameState('PAUSED');
        if (bgmRef.current) bgmRef.current.pause();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePauseTrigger();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePauseTrigger);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePauseTrigger);
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (gameState === 'PLAYING') {
      playBgm(bgmRef.current, isMuted);
    } else {
      stopBgm(bgmRef.current, gameState === 'GAMEOVER');
    }
  }, [gameState, isMuted]);

  const pulse = (ms: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  };

  const triggerEvent = (key: string, x: number, y: number, color: string) => {
    playSound(audioCtx.current, key as AudioKey, isMutedRef.current);
    particles.current.push({ x, y, vx: 0, vy: 0, life: 1.0, color, size: 10, type: 'PULSE' });
  };

  const trackRunEnd = () => {
    const result: GameResult = {
      gameId,
      score: scoreRef.current,
      duration: runStartedAtRef.current ? (Date.now() - runStartedAtRef.current) / 1000 : 0,
      metadata: {
        mode: gameModeRef.current,
        shieldUsed: usedShieldRef.current,
        zonesReached: levelRef.current,
      },
    };

    onGameOver?.(result);

    checkAchievements({
      finalScore: scoreRef.current,
      unlockedBadges,
      usedShield: usedShieldRef.current,
      currentHighScore: highScoreRef.current,
      setUnlockedBadges,
      setHighScore: (next: number) => {
        setHighScore(next);
        highScoreRef.current = next;
      },
    });
    recordRun();
    setTotalRuns(parseInt(localStorage.getItem('syncOrSinkRuns') || '0'));
    runStartedAtRef.current = null;
  };

  const initWorld = () => {
    levelRef.current = 0;
    distanceRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    prevEnvIdx.current = 0;
    nextEnvIdx.current = 0;
    transitionProgress.current = 1;
    setCurrentEnv(ENVIRONMENTS[0]);
    speedRef.current = BASE_SPEED;
    pLeft.current = resetPlayer(ENVIRONMENTS[0].accent);
    pRight.current = resetPlayer(ENVIRONMENTS[0].accent);
    obstacles.current = [];
    particles.current = [];
    texts.current = [];
    bgProps.current = [];
    shieldActive.current = false;
    shieldTimer.current = 0;
    usedShieldRef.current = false;
    ghostActive.current = false;
    ghostTimer.current = 0;
    glitchActive.current = false;
    glitchTimer.current = 0;
    setGhostTimeRemaining(0);
    lastTimeRef.current = 0;
  };

  const update = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16, 2);
    lastTimeRef.current = timestamp;

    if (gameStateRef.current === 'PLAYING') {
      const currentSpeed = speedRef.current * (glitchActive.current ? 1.5 : 1.0);
      distanceRef.current += (currentSpeed * deltaTime) * PIXELS_TO_METERS;
      const currentAltitude = Math.floor(distanceRef.current);
      if (currentAltitude > scoreRef.current) {
        setScore(currentAltitude);
        scoreRef.current = currentAltitude;
      }

      if (transitionProgress.current < 1) {
        transitionProgress.current += 0.015 * deltaTime;
        if (transitionProgress.current >= 1) transitionProgress.current = 1;
      }

      const newLevel = Math.floor(currentAltitude / METERS_PER_LEVEL);
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        prevEnvIdx.current = nextEnvIdx.current;
        nextEnvIdx.current = Math.min(newLevel, ENVIRONMENTS.length - 1);
        transitionProgress.current = 0;
        setCurrentEnv(ENVIRONMENTS[nextEnvIdx.current]);
        speedRef.current = BASE_SPEED * Math.pow(SPEED_MULTIPLIER, newLevel);
        const newEnv = ENVIRONMENTS[nextEnvIdx.current];
        spawnText(texts.current, MID, 200, `🌊 ${newEnv.name}`, newEnv.accent);
        spawnText(texts.current, MID, 230, newEnv.depth || '', '#888');
        triggerEvent('level', MID, 300, '#FFF');
        pulse(100);
      }

      if (shieldActive.current) {
        shieldTimer.current -= deltaTime;
        if (shieldTimer.current <= 0) shieldActive.current = false;
      }
      if (ghostActive.current) {
        ghostTimer.current -= deltaTime;
        const remaining = Math.ceil(ghostTimer.current / 60);
        setGhostTimeRemaining(remaining > 0 ? remaining : 0);
        if (ghostTimer.current <= 0) {
          ghostActive.current = false;
          setGhostTimeRemaining(0);
          spawnText(texts.current, MID, 300, 'PHASE ENDED', '#FFF');
          pulse(50);
        }
      }
      if (glitchActive.current) {
        glitchTimer.current -= deltaTime;
        shakeRef.current = 5;
        if (glitchTimer.current <= 0) {
          glitchActive.current = false;
          spawnText(texts.current, MID, 300, 'SURGE ENDED', '#FFF');
          pulse(50);
        }
      }

      const activeEnv = ENVIRONMENTS[nextEnvIdx.current];
      if (Math.random() < 0.05) spawnBgProp(bgProps.current, activeEnv.type, WIDTH);
      bgProps.current.forEach((p) => {
        p.y += (currentSpeed * 0.5 * p.speed) * deltaTime;
      });
      bgProps.current = bgProps.current.filter((p) => p.y < HEIGHT + 50);

      [pLeft.current, pRight.current].forEach((p) => {
        updatePlayerPhysics(p, deltaTime, FLOOR, HEIGHT, {
          onLanding: () => {
            if (!p.grounded) spawnDust(particles.current, p === pLeft.current ? MID / 2 : MID + MID / 2, FLOOR);
          },
          onBufferedJump: () => {
            spawnExplosion(particles.current, p === pLeft.current ? 100 : 300, p.y + 20, '#fff', 5);
          },
          onFallOut: () => {
            if (!GOD_MODE) {
              gameStateRef.current = 'GAMEOVER';
              setGameState('GAMEOVER');
              trackRunEnd();
              pulse(400);
              if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
              }
            }
          },
        });
      });

      frameCount.current += deltaTime;
      const currentSpawnRate = Math.max(30, SPAWN_RATE_BASE - levelRef.current * 5);
      if (frameCount.current > currentSpawnRate) {
        const rand = Math.random();
        if (rand < 0.03 && !ghostActive.current) {
          spawnSpecial(obstacles.current, 'GHOST', MID);
        } else if (rand < 0.06 && !glitchActive.current) {
          spawnSpecial(obstacles.current, 'GLITCH', MID);
        } else if (rand < 0.10 && !shieldActive.current) {
          spawnSpecial(obstacles.current, 'ORB', MID);
        } else {
          if (Math.random() > 0.5) {
            spawnBlock(obstacles.current, 'LEFT', MID);
          } else {
            spawnBlock(obstacles.current, 'RIGHT', MID);
          }
        }
        frameCount.current = 0;
      }

      obstacles.current.forEach((obs) => {
        obs.y += currentSpeed * deltaTime;
        const p = obs.lane === 'LEFT' ? pLeft.current : pRight.current;
        const pX = obs.lane === 'LEFT' ? MID / 2 - PLAYER_SIZE / 2 : MID + MID / 2 - PLAYER_SIZE / 2;
        const isJumpingOver = !p.grounded && p.y < FLOOR - PLAYER_SIZE - 20;

        const outcome = handleObstacleCollision({
          player: p,
          obstacle: obs,
          playerX: pX,
          playerY: p.y,
          playerSize: PLAYER_SIZE,
          hitboxPadding: HITBOX_PADDING,
          ghostActive: ghostActive.current,
          shieldActive: shieldActive.current,
          glitchActive: glitchActive.current,
          isJumpingOver,
        });

        if (outcome === 'NONE') {
          if (!obs.passed && !obs.collided && obs.y > p.y + PLAYER_SIZE) obs.passed = true;
          return;
        }

        if (outcome === 'ORB') {
          if (!p.grounded) return;
          obs.collided = true;
          shieldActive.current = true;
          usedShieldRef.current = true;
          shieldTimer.current = 300;
          spawnText(texts.current, pX, p.y - 40, 'SHIELD UP!', '#00BFFF');
          triggerEvent('level', pX, p.y, '#FFF');
          pulse(50);
          return;
        }

        if (outcome === 'GHOST') {
          if (!p.grounded) return;
          obs.collided = true;
          ghostActive.current = true;
          ghostTimer.current = 480;
          spawnText(texts.current, MID, 300, '👻 PHASE SHIFT!', '#d946ef');
          triggerEvent('level', pX, p.y, '#d946ef');
          pulse(50);
          return;
        }

        if (outcome === 'GLITCH') {
          if (!p.grounded) return;
          if (glitchActive.current) return;
          obs.collided = true;
          glitchActive.current = true;
          glitchTimer.current = 360;
          spawnText(texts.current, MID, 300, '⚡ SURGE SPEED!', '#ff0000');
          shakeRef.current = 20;
          triggerEvent('crash', pX, p.y, '#F00');
          pulse(150);
          return;
        }

        if (outcome === 'BLOCK' && !isJumpingOver) {
          if (ghostActive.current) return;
          obs.collided = true;
          if (shieldActive.current) {
            shieldActive.current = false;
            spawnExplosion(particles.current, pX, p.y, '#FFF', 20);
            spawnText(texts.current, MID, 300, 'SHIELD SAVED YOU', '#FFF');
            shakeRef.current = 10;
            triggerEvent('crash', pX, p.y, '#F00');
            pulse(100);
          } else if (p.flash <= 0) {
            shakeRef.current = 30;
            spawnExplosion(particles.current, pX, p.y, activeEnv.accent, 30);
            triggerEvent('crash', pX, p.y, '#F00');
            if (!GOD_MODE) {
              gameStateRef.current = 'GAMEOVER';
              setGameState('GAMEOVER');
              trackRunEnd();
              pulse(400);
              if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
              }
            }
          }
        }

        if (!obs.passed && !obs.collided && obs.y > p.y + PLAYER_SIZE) obs.passed = true;
      });
      obstacles.current = obstacles.current.filter((o) => o.y < HEIGHT + 50 && !o.collided);
    }

    renderGame({
      ctx,
      prevEnvIdx: prevEnvIdx.current,
      nextEnvIdx: nextEnvIdx.current,
      transitionProgress: transitionProgress.current,
      ghostActive: ghostActive.current,
      glitchActive: glitchActive.current,
      shieldActive: shieldActive.current,
      shakeRef,
      bgProps,
      obstacles,
      particles,
      texts,
      pLeft,
      pRight,
    });
  };

  useEffect(() => {
    initWorld();
    const stop = startGameLoop(update);
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      stopGameLoop(stop);
    };
  }, []);

  const doJump = (p: Player, xPos: number) => {
    doJumpPlayer(
      p,
      xPos,
      gameStateRef.current,
      JUMP_FORCE,
      JUMP_BUFFER_TIME,
      2,
      (x, y) => {
        spawnExplosion(particles.current, x, y, '#fff', 5);
        triggerEvent('jump', x, y, '#fff');
      }
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'PLAYING') return;

    if (gameModeRef.current === 'LINKED') {
      handleLinkedJump(pLeft.current, pRight.current, 100, 300, {
        gameState: gameStateRef.current,
        jumpForce: JUMP_FORCE,
        jumpBufferTime: JUMP_BUFFER_TIME,
        maxJumps: 2,
        onJump: (x, y) => {
          spawnExplosion(particles.current, x, y, '#fff', 5);
          triggerEvent('jump', x, y, '#fff');
        },
      });
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const lane = getPointerLane(e.clientX, rect.left, rect.width);
    if (lane === 'LEFT') {
      doJump(pLeft.current, 100);
    } else {
      doJump(pRight.current, 300);
    }
  };

  const handlePointerUp = (_e: React.PointerEvent<HTMLCanvasElement>) => {
    releaseJumpPlayer(pLeft.current);
    releaseJumpPlayer(pRight.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape' && gameStateRef.current === 'PLAYING') {
        gameStateRef.current = 'PAUSED';
        setGameState('PAUSED');
        if (bgmRef.current) bgmRef.current.pause();
        return;
      }
      if (gameStateRef.current === 'PLAYING') {
        if (gameModeRef.current === 'LINKED') {
          if (e.code === 'Space' || e.key === 'ArrowUp') {
            doJump(pLeft.current, 100);
            doJump(pRight.current, 300);
          }
        } else {
          if (e.key === 'ArrowLeft' || e.key === 'a') doJump(pLeft.current, 100);
          if (e.key === 'ArrowRight' || e.key === 'd') doJump(pRight.current, 300);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameModeRef.current === 'LINKED') {
        if (e.code === 'Space' || e.key === 'ArrowUp') {
          releaseJumpPlayer(pLeft.current);
          releaseJumpPlayer(pRight.current);
        }
      } else {
        if (e.key === 'ArrowLeft' || e.key === 'a') releaseJumpPlayer(pLeft.current);
        if (e.key === 'ArrowRight' || e.key === 'd') releaseJumpPlayer(pRight.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMode = gameMode === 'LINKED' ? 'DUAL' : 'LINKED';
    setGameMode(newMode);
    gameModeRef.current = newMode;
  };

  const handleStartGame = () => {
    runStartedAtRef.current = Date.now();

    if (bgmRef.current && !isMuted) {
      playBgm(bgmRef.current, false);
      bgmRef.current.currentTime = 0;
    }
    if (showNameInput && username.trim().length > 0) {
      localStorage.setItem('syncOrSinkName', username);
      setShowNameInput(false);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setGameState('COUNTDOWN');
    gameStateRef.current = 'COUNTDOWN';
    setCountdown(3);
    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        setGameState('PLAYING');
        gameStateRef.current = 'PLAYING';
        onGameStart?.();
        initWorld();
      }
    }, 600);
  };

  const initiateDive = () => {
    const hasSeenTutorial = localStorage.getItem('syncOrSinkTutorialSeen');
    if (hasSeenTutorial) {
      handleStartGame();
    } else {
      setTutorialStep(0);
      setGameState('TUTORIAL');
      gameStateRef.current = 'TUTORIAL';
    }
  };

  const finishTutorial = () => {
    localStorage.setItem('syncOrSinkTutorialSeen', 'true');
    handleStartGame();
  };

  const handleHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameStateRef.current = 'START';
    setGameState('START');
    initWorld();
    stopBgm(bgmRef.current, true);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameStateRef.current = 'PAUSED';
    setGameState('PAUSED');
    if (bgmRef.current) bgmRef.current.pause();
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
    lastTimeRef.current = 0;
    if (bgmRef.current && !isMuted) bgmRef.current.play();
  };

  const handleShare = () => {
    const text = `I ascended to ${score}m in SyncOrSink! #SyncOrSink 🚀`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderTutorial = () => {
    const steps = [
      { text: 'WELCOME PILOT. ASCEND TO SURVIVE.', top: '40%', left: '50%' },
      { text: 'JUMP TO AVOID OBSTACLES', top: '60%', left: '50%', arrow: '⬇' },
      { text: 'ITEMS FLOAT! JUMP TO CATCH THEM.', top: '40%', left: '50%' },
      { text: 'RUN UNDER ITEMS TO SKIP THEM.', top: '80%', left: '50%' },
    ];
    const step = steps[tutorialStep];
    return (
      <div className="absolute inset-0 z-50 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="absolute bg-white text-black p-4 rounded-xl max-w-[200px] text-center font-bold text-sm shadow-xl transition-all duration-300" style={{ top: step.top, left: step.left, transform: 'translate(-50%, -50%)' }}>
          {step.arrow && step.arrow === '⬆' && <div className="text-2xl mb-1 text-cyan-500 animate-bounce">⬆</div>}
          {step.text}
          {step.arrow && step.arrow === '⬇' && <div className="text-2xl mt-1 text-red-500 animate-bounce">⬇</div>}
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={finishTutorial} className="text-[10px] text-gray-500 hover:text-black">SKIP</button>
            <button onClick={() => {
              if (tutorialStep < steps.length - 1) setTutorialStep((s) => s + 1);
              else finishTutorial();
            }} className="bg-black text-white px-3 py-1 rounded text-xs">NEXT</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="absolute top-16 w-full max-w-[400px] flex justify-between px-4 z-10 pointer-events-none">
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/20 flex flex-col items-center"><span className="text-[10px] text-gray-400 tracking-[0.3em]">ASCENT</span><span className="text-xl font-bold font-mono text-white">{score}m</span></div>
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/20 flex flex-col items-center"><span className="text-[10px] text-gray-400 tracking-[0.3em]">ZONE</span><span className="text-xs font-bold font-mono text-white">{currentEnv.name}</span></div>
      </div>
      {ghostTimeRemaining > 0 && <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-purple-500/20 border border-purple-500 px-4 py-1 rounded-full text-xs font-bold text-purple-300 z-10 animate-pulse">👻 GHOST: {ghostTimeRemaining}s</div>}
      <button onClick={() => setIsMuted(!isMuted)} className={`absolute top-16 left-1/2 -translate-x-12 z-20 p-2 rounded-full backdrop-blur border pointer-events-auto transition-all ${isMuted ? 'bg-red-500/20 border-red-500' : 'bg-white/10 border-white/20'}`}>{isMuted ? '🔇' : '🔊'}</button>
      {gameState === 'PLAYING' && <button onClick={handlePause} className="absolute top-16 right-1/2 translate-x-12 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur border border-white/20 pointer-events-auto"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg></button>}
      <canvas ref={canvasRef} width={400} height={600} className="w-full h-full object-cover touch-none" style={{ background: '#000' }} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} />
      {(gameState !== 'PLAYING') && (
        <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center backdrop-blur-sm z-20 animate-fade-in p-4">
          {gameState === 'COUNTDOWN' && <div className="text-8xl font-black text-white animate-ping">{countdown}</div>}
          {gameState === 'PAUSED' && <div className="flex flex-col gap-4 pointer-events-auto w-full max-w-[200px]"><h2 className="text-3xl font-bold italic mb-4 text-center">PAUSED</h2><button onClick={handleResume} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">RESUME</button><button onClick={handleHome} className="bg-gray-700 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600">QUIT</button></div>}
          {gameState === 'TUTORIAL' && renderTutorial()}
          {showGuide && <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center p-6 z-30 pointer-events-auto"><h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-400 pb-2">SYSTEM LOG</h2><div className="space-y-4 text-xs text-gray-300 w-full max-w-[280px]"><div className="flex items-start gap-3"><span className="text-xl">⚪</span><div><strong className="text-white block">SHIELD ORB</strong>Protects against one hit.</div></div><div className="flex items-start gap-3"><span className="text-xl">👻</span><div><strong className="text-purple-400 block">PHANTOM MODE</strong>8s Invincibility.</div></div><div className="flex items-start gap-3"><span className="text-xl">🔺</span><div><strong className="text-red-500 block">GLITCH TRAP</strong>Causes Turbo Speed. <span className="text-red-400">AVOID.</span></div></div></div><button onClick={() => setShowGuide(false)} className="mt-8 border border-white/20 px-6 py-2 rounded-full text-xs font-bold hover:bg-white/10">CLOSE LOG</button></div>}
          {gameState === 'GAMEOVER' && <div className="mb-8 text-center flex flex-col items-center w-full"><p className="text-blue-500 font-black text-3xl mb-2 animate-bounce">YOU SINKED 😂</p><div className="bg-white/10 p-4 rounded-xl mb-4 w-full max-w-[280px]"><p className="text-gray-400 text-xs tracking-widest">FINAL ASCENT</p><p className="text-4xl font-bold text-white mb-2">{score}m</p><div className="flex justify-between text-xs text-gray-500 border-t border-white/10 pt-2"><span>BEST: {highScore}m</span>{score >= highScore && <span className="text-yellow-400">NEW RECORD!</span>}</div></div><div className="flex gap-2 mb-6 flex-wrap justify-center max-w-[300px]">{SYNC_OR_SINK_ACHIEVEMENTS.map((a) => (<span key={a.id} className={`bg-gray-800/50 border ${unlockedBadges.includes(a.id) ? 'border-yellow-500 text-yellow-200' : 'border-gray-700 text-gray-500 opacity-50'} px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1`}>{a.icon} {a.name}</span>))}</div><div className="flex flex-col gap-3 w-full max-w-[280px] pointer-events-auto"><button onClick={handleStartGame} className="bg-white hover:bg-gray-200 text-black w-full py-4 rounded-full font-bold text-sm tracking-widest transition-all">TRY AGAIN</button><div className="flex gap-3"><button onClick={handleHome} className="bg-gray-800 hover:bg-gray-700 text-white flex-1 py-3 rounded-full font-bold text-xs tracking-widest transition-all">HOME</button><button onClick={handleShare} className="bg-blue-500 hover:bg-blue-400 text-white flex-1 py-3 rounded-full font-bold text-xs tracking-widest transition-all">SHARE</button></div></div></div>}
          {gameState === 'START' && <><h1 className="text-5xl font-black italic tracking-tighter mb-2 text-center"><span className="text-cyan-400">SYNC</span><span className="text-white mx-2">OR</span><span className="text-blue-600">SINK</span></h1>{showNameInput && (<div className="mb-4"><input type="text" placeholder="ENTER PILOT NAME" className="bg-white/10 border border-white/20 rounded px-4 py-2 text-center text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 uppercase font-bold text-sm tracking-widest" maxLength={12} value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())} /></div>)}<div className="flex gap-4 mb-8 mt-4 pointer-events-auto"><button onClick={toggleMode} className={`px-4 py-2 rounded border text-xs font-bold transition-all ${gameMode === 'LINKED' ? 'bg-white text-black border-white' : 'text-gray-500 border-gray-700'}`}>LINKED</button><button onClick={toggleMode} className={`px-4 py-2 rounded border text-xs font-bold transition-all ${gameMode === 'DUAL' ? 'bg-white text-black border-white' : 'text-gray-500 border-gray-700'}`}>DUAL</button></div><button onClick={initiateDive} className="pointer-events-auto border border-white/20 bg-white/5 px-12 py-5 rounded-full hover:bg-white/10 transition-colors active:scale-95 shadow-lg shadow-cyan-500/20"><span className="font-bold text-white tracking-widest text-lg">INITIATE DIVE</span></button><button onClick={() => setShowGuide(true)} className="mt-6 text-xs text-gray-500 hover:text-white underline tracking-widest pointer-events-auto">SYSTEM INFO</button></>}
        </div>
      )}
    </>
  );
};
