'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Totemrock from './Totemrock';
import { Button } from '@/components/ui/button';
import { ConnectButton, useConnection } from 'arweave-wallet-kit';
import { cashOut, placeBet, makeMove } from '@/lib/ao-lib';

interface GamingAreaProps {
  changeState: () => void;
  resetState: () => void;
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
}

interface GameState {
  status: 'active' | 'lost' | 'won';
  level: number;
  multiplier: number;
  credits: number;
  row: ('unknown' | 'reward' | 'magma')[];
}

interface GameHistory {
  [level: number]: GameState['row'];
}

const roundToOneDecimal = (value: number) => {
  return Math.round(value * 10) / 10;
};

export default function GamingArea({ changeState, resetState, state, setState }: GamingAreaProps) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [breakingRock, setBreakingRock] = useState<boolean>(false);
  const [isAutoPicking, setIsAutoPicking] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<{ row: number; col: number; y: number } | null>(null);
  const [betPlaced, setBetPlaced] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory>({});
  const { connected } = useConnection();
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [crackingRocks, setCrackingRocks] = useState<{ [key: string]: boolean }>({});

  const rows = 7;
  const columns = 3;

  const steps = [
    { value: 1, label: "1x" },
    { value: 1.5, label: "1.5x" },
    { value: 2.5, label: "2.5x" },
    { value: 5, label: "5x" },
    { value: 10, label: "10x" },
    { value: 25, label: "25x" },
    { value: 50, label: "50x" },
    { value: 100, label: "100x" },
  ];

  const handlePrizeClick = useCallback(async (rowIndex: number, colIndex: number) => {
    if (!betPlaced || !gameId) {
      alert('Please place a bet before starting the game!');
      return;
    }

    if (!gameStarted) {    
      setGameStarted(true);
    }

    setBreakingRock(true);
    setPlayerPosition({ row: rowIndex, col: colIndex, y: 0 });

    // Start cracking animation
    setCrackingRocks(prev => ({ ...prev, [`${rowIndex}-${colIndex}`]: true }));

    // Add a delay to show the cracking and shaking animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await makeMove(gameId, colIndex);
      setGameState(response);

      // Update game history for the current level
      setGameHistory(prev => ({
        ...prev,
        [currentLevel]: response.row
      }));

      if (response.status === 'lost') {
        setShowAll(true);
        setGameStarted(false);
        handleLoss();
      } else if (response.status === 'won' || currentLevel === 7) {
        setShowAll(true);
        setGameStarted(false);
        handleWin();
      } else {
        setState(currentLevel);
        setCurrentLevel(prev => prev + 1);
        // Move to the next level after a short delay
        setTimeout(() => {
          setShowAll(false);
          setCrackingRocks({});
        }, 1000);
      }
    } catch (error) {
      console.error("Error making move:", error);
      alert('An error occurred while making your move. Please try again.');
    }

    // Delay resetting breakingRock to allow for the reveal animation
    setTimeout(() => {
      setBreakingRock(false);
      setCrackingRocks(prev => ({ ...prev, [`${rowIndex}-${colIndex}`]: false }));
    }, 1500);
  }, [betPlaced, gameId, gameStarted, setState, currentLevel]);

  const handleLoss = () => {
  
    const initialJump = 20;
    setPlayerPosition(prev => prev ? { ...prev, y: prev.y - initialJump } : null);

    setTimeout(() => {
      setBreakingRock(false);
      
      let fallDistance = 0;
      const fallAnimation = setInterval(() => {
        setPlayerPosition(prev => {
          if (prev) {
            fallDistance += 10;
            const newY = prev.y + fallDistance;
            if (newY < 700) {
              return { ...prev, y: newY };
            } else {
              clearInterval(fallAnimation);
              setTimeout(() => {
                alert('Game Over! You hit magma.');
                resetGame();
              }, 100);
              return null;
            }
          }
          return null;
        });
      }, 50);
    }, 200);
  };

  const resetGame = () => {
    setShowAll(false);
    setGameStarted(false);
    setBetPlaced(false);
    setGameState(null);
    setGameHistory({});
    setPlayerPosition(null);
    setInputValue('');
    setGameId(null);
    setIsAutoPicking(false);
    setCurrentLevel(1);
    resetState();
  };

  const AutoPick = useCallback(() => {
    if (!betPlaced || !gameId || !gameState) {
      alert('Please place a bet before starting the game!');
      return;
    }

    setIsAutoPicking(!isAutoPicking);
  }, [betPlaced, gameId, gameState, isAutoPicking]);

  const handleAutoPickStart = useCallback(() => {
    if (!gameState || gameState.status !== 'active') {
      return;
    }

    const randomColIndex = Math.floor(Math.random() * 3);
    handlePrizeClick(8 - gameState.level, randomColIndex);
  }, [gameState, handlePrizeClick]);

  const handlePlaceBet = async () => {
    if (!connected) {
      alert('Please connect your wallet to place a bet!');
      return;
    }
    
    if (inputValue && parseFloat(inputValue) > 0) {
      const betAmount = parseFloat(inputValue);
      try {
        const newGameId = await placeBet(betAmount * 1000000000000);
        console.log("gameId", newGameId);
        setGameId(newGameId);
        setBetPlaced(true);
        setGameState({
          status: 'active',
          level: 1,
          multiplier: 1,
          credits: betAmount,
          row: ['unknown', 'unknown', 'unknown']
        });
        setCurrentLevel(1);
      } catch (error) {
        console.error("Error placing bet:", error);
        alert('An error occurred while placing your bet. Please try again.');
      }
    } else {
      alert('Please enter a valid bet amount!');
    }
  };

  const handleCashOut = useCallback(async () => {
    if (!gameId || !gameState) {
      alert('No active game to cash out from.');
      return;
    }

    try {
      const cashOutResult = await cashOut(gameId);
      alert(`Successfully cashed out ${cashOutResult} credits!`);
      resetGame();
    } catch (error) {
      console.error("Error during cash out:", error);
      alert('An error occurred while cashing out. Please try again.');
    }
  }, [gameId, gameState, resetGame]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleWin = useCallback(async () => {
    if (!gameState) return;
    
    const result = await new Promise<boolean>((resolve) => {
      if (currentLevel === 7) {
        alert(`Congratulations! You've reached the top level and won ${gameState.credits.toFixed(2)} tokens! Press OK to cash out.`);
      } else {
        alert(`Congratulations! You've won ${gameState.credits.toFixed(2)} tokens! Press OK to cash out.`);
      }
      resolve(true);
    });

    if (result) {
      await handleCashOut();
    }
  }, [gameState, currentLevel, handleCashOut]);

  return (
    <div className='py-16 flex flex-row h-fit gap-x-10 justify-center items-center'>
      <div className='w-[300px] relative h-[700px] bg-black rounded-sm'>
        <div className='flex gap-3 py-7 px-4'>
          <Button 
            className='w-32 bg-[#1D293B] hover:bg-[#263549] focus:bg-[#141d2a] text-white'
            onClick={() => { setIsAutoPicking(false); }}
          >
            Manual
          </Button>
          <Button 
            className={`w-32 ${isAutoPicking ? 'bg-[#9f2a1f] hover:bg-[#872219]' : 'bg-[#872219] hover:bg-[#9f2a1f]'} focus:bg-[#6f1c14] text-white`}
            onClick={AutoPick}
          >
            {isAutoPicking ? 'Stop Auto' : 'AutoPick'}
          </Button>
        </div>
        <div className='px-4 flex flex-col gap-4'>
          <h2 className='font-medium text-white'>Bet amount</h2>
          <input 
            type="number" 
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter amount" 
            className='bg-[#556478] border-[#4B5563] text-white rounded py-5 flex h-9 w-full border border-input bg-transparent px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
          />
          <Button 
            className='w-full bg-[#23C55E] hover:bg-[#31ed76]' 
            onClick={handlePlaceBet}
            disabled={betPlaced}
          >
            {betPlaced ? 'Bet Placed' : 'Place Bet'}
          </Button>
          <ConnectButton />
          {isAutoPicking && (
            <Button 
              className='w-full bg-[#23C55E] hover:bg-[#31ed76]' 
              onClick={handleAutoPickStart}
              disabled={!betPlaced || !gameState || gameState.status !== 'active'}
            >
              Start Auto-Pick
            </Button>
          )}
        </div>
       
        <div className='px-4 '>
          {gameState && gameState.status === 'active' && gameState.level > 1
            ? <Button className='w-full bg-green-600' onClick={handleCashOut}>Checkout</Button>
            : <Button className='w-full hidden bg-green-600'>Start</Button>}
        </div>
        {gameState && gameState.level >= 2 && (
          <div className='absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[280px] h-[90px] flex flex-col items-center justify-center px-4 bg-stone-500 py-2 rounded-xl'>
            <h2 className='text-3xl font-bold text-green-500'>{roundToOneDecimal(gameState.multiplier)}X</h2>
            <p className='text-white text-sm'>Cash out available: {gameState.credits.toFixed(2)} tokens</p>
          </div>
        )}
        {!gameStarted && (
          <div className='absolute bottom-5 w-full flex gap-x-8 items-center justify-center px-4'>
            <img src="/assets/character.png" alt="" className='w-12 animation-pulse' />
            <h2 className='text-white'>Click one of the<br /> blue tiles to start</h2>
          </div>
        )}
      </div>
      
      <div className='p-2 w-[480px] mr-28 relative'>
        <div 
          className='absolute inset-0 bg-black bg-opacity-50 rounded-lg -left-6 h-[700px] z-10'
          style={{ top: '-24px' }}
        ></div>
        <div className='relative z-10'>
          <div className="grid grid-cols-3 grid-rows-7 gap-3">
            {Array.from({ length: rows }, (_, rowIndex) => (
              Array.from({ length: columns }, (_, colIndex) => {
                const level = rows - rowIndex;
                const isCurrentRow = level === currentLevel;
                const isPastRow = level < currentLevel;
                const rowState = gameHistory[level] || ['unknown', 'unknown', 'unknown'];
                const isCracking = crackingRocks[`${rowIndex}-${colIndex}`];

                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className='bg-transparent relative' 
                    onClick={() => isCurrentRow ? handlePrizeClick(rowIndex, colIndex) : null}
                  >
                    {isPastRow || (isCurrentRow && showAll) ? (
                      rowState[colIndex] === 'reward' ? <Totemrock /> : 
                      rowState[colIndex] === 'magma' ? <img src={`/assets/glowLava3.png`} className="w-[124px]" alt='lava rock' /> :
                      <img src={`/assets/blueRock.png`} className="w-[124px]" alt='blue rock' />
                    ) : isCurrentRow ? (
                      isCracking ? (
                        <img src={`/assets/crackedBlue.png`} className="w-[124px] animate-shake" alt='cracked blue rock' />
                      ) : (
                        <img src={`/assets/blueRock.png`} className="w-[124px] animate-pulse" alt='blue rock' />
                      )
                    ) : (
                      <img src={`/assets/basicRock.png`} className="w-[124px]" alt='basic rock' />
                    )}
                  </div>
                );
              })
            ))}
          </div>
          {playerPosition && (
            <img 
              src="/assets/character.png" 
              alt="" 
              className='w-12 animation-pulse absolute transition-all duration-200 ease-in-out'
              style={{
                top: `calc(${playerPosition.row * (100 / 7)}% + ${playerPosition.y}px)`,
                left: `calc(${playerPosition.col * (100 / 3)}% + 60px)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
