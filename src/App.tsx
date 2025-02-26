import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Trophy, RefreshCw } from 'lucide-react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

function getSegmentStyle(
  index: number,
  snake: Position[],
  direction: Direction,
  isHead: boolean
): string {
  if (isHead) {
    return 'rounded-full bg-green-700 border-2 border-green-900';
  }

  if (index === snake.length - 1) {
    return 'rounded-full bg-green-500 border-2 border-green-700';
  }

  const current = snake[index];
  const prev = snake[index - 1];
  const next = snake[index + 1];

  const isVertical = prev.x === next.x;
  const isHorizontal = prev.y === next.y;
  const isTurn = !isVertical && !isHorizontal;

  if (isTurn) {
    // Determine which corner this segment forms
    const isTopRight = (prev.x > current.x && next.y > current.y) || (prev.y < current.y && next.x < current.x);
    const isTopLeft = (prev.x < current.x && next.y > current.y) || (prev.y < current.y && next.x > current.x);
    const isBottomRight = (prev.x > current.x && next.y < current.y) || (prev.y > current.y && next.x < current.x);
    const isBottomLeft = (prev.x < current.x && next.y < current.y) || (prev.y > current.y && next.x > current.x);

    if (isTopRight) return 'rounded-tr-full bg-green-500 border-2 border-green-700';
    if (isTopLeft) return 'rounded-tl-full bg-green-500 border-2 border-green-700';
    if (isBottomRight) return 'rounded-br-full bg-green-500 border-2 border-green-700';
    if (isBottomLeft) return 'rounded-bl-full bg-green-500 border-2 border-green-700';
  }

  return `${isVertical ? 'rounded-none' : 'rounded-full'} bg-green-500 border-2 border-green-700`;
}

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
      ? generateFood()
      : newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  }; 

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(currentSnake => {
      const head = currentSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP':
          newHead.y -= 1;
          break;
        case 'DOWN':
          newHead.y += 1;
          break;
        case 'LEFT':
          newHead.x -= 1;
          break;
        case 'RIGHT':
          newHead.x += 1;
          break;
      }

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return currentSnake;
      }

      if (
        currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 1;
          setHighScore(h => Math.max(h, newScore));
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }

      if (gameOver) {
        resetGame();
        return;
      }

      const newDirection: { [key: string]: Direction } = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
      };

      if (newDirection[e.key]) {
        const current = direction;
        const next = newDirection[e.key];
        
        const invalidMoves = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT',
        };

        if (invalidMoves[current] !== next) {
          setDirection(next);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-emerald-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Snake Game</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              <span className="font-semibold">High Score: {highScore}</span>
            </div>
            <button
              onClick={resetGame}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Reset Game"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className="grid gap-[1px] bg-emerald-100 p-1 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              width: GRID_SIZE * CELL_SIZE + GRID_SIZE + 2,
              height: GRID_SIZE * CELL_SIZE + GRID_SIZE + 2,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
              const isSnake = snakeIndex !== -1;
              const isFood = food.x === x && food.y === y;
              const isHead = snakeIndex === 0;

              return (
                <div
                  key={i}
                  className={`w-5 h-5 flex items-center justify-center transition-all duration-100 ${
                    isSnake
                      ? getSegmentStyle(snakeIndex, snake, direction, isHead)
                      : isFood
                      ? 'relative'
                      : 'bg-emerald-50'
                  }`}
                >
                  {isFood && (
                    <>
                      <div className="absolute w-4 h-4 bg-red-500 rounded-full" />
                      <div className="absolute w-1 h-2 bg-green-800 -top-1 left-1/2 -translate-x-1/2 rounded-t-full" />
                      <div className="absolute w-2 h-1 bg-green-800 -left-1 top-1/2 -translate-y-1/2 rounded-l-full" />
                    </>
                  )}
                  {isHead && (
                    <>
                      <div className="absolute w-1.5 h-1.5 bg-black rounded-full -translate-x-1" style={{
                        top: direction === 'DOWN' ? '60%' : direction === 'UP' ? '20%' : '40%',
                        left: direction === 'RIGHT' ? '60%' : direction === 'LEFT' ? '20%' : '40%'
                      }} />
                      <div className="absolute w-1.5 h-1.5 bg-black rounded-full translate-x-1" style={{
                        top: direction === 'DOWN' ? '60%' : direction === 'UP' ? '20%' : '40%',
                        left: direction === 'RIGHT' ? '60%' : direction === 'LEFT' ? '20%' : '40%'
                      }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">
                  {gameOver ? 'Game Over!' : 'Paused'}
                </h2>
                <p className="text-xl mb-4">Score: {score}</p>
                <button
                  onClick={gameOver ? resetGame : () => setIsPaused(false)}
                  className="bg-white text-emerald-600 px-6 py-2 rounded-full font-semibold hover:bg-emerald-50 transition-colors"
                >
                  {gameOver ? 'Play Again' : 'Resume'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-lg text-gray-800">Current Score: {score}</p>
          <p>Use arrow keys or WASD to control the snake</p>
          <p>Press SPACE to pause/resume</p>
          <p>Press any key to start a new game when game is over</p>
        </div>
      </div>
    </div>
  );
}

export default App;