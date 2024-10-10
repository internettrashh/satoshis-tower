'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Totemrock from './Totemrock';
import { Button } from '@/components/ui/button';


interface GamingAreaProps {
  changeState: () => void;
  resetState: () => void;
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
}

interface Row {
  prizes: string[];
}

export default function GamingArea({ changeState, resetState, state, setState }: GamingAreaProps) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [breakingRock, setBreakingRock] = useState<boolean>(false);
  const [isAutoPicking, setIsAutoPicking] = useState(false);
  const [lost, setLost] = useState<boolean>(false);
  const [money, setMoney] = useState<number>(0);
  const [originalMoney, setOriginalMoney] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<{ row: number; col: number; y: number } | null>(null);
  const [betPlaced, setBetPlaced] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);

  const rows: Row[] = [
    { prizes: ['Prize 1A', 'Prize 1B', 'Prize 1C'] },
    { prizes: ['Prize 2A', 'Prize 2B', 'Prize 2C'] },
    { prizes: ['Prize 3A', 'Prize 3B', 'Prize 3C'] },
    { prizes: ['Prize 4A', 'Prize 4B', 'Prize 4C'] },
    { prizes: ['Prize 5A', 'Prize 5B', 'Prize 5C'] },
    { prizes: ['Prize 6A', 'Prize 6B', 'Prize 6C'] },
    { prizes: ['Prize 7A', 'Prize 7B', 'Prize 7C'] },
  ];

  const [correctPrizes, setCorrectPrizes] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState<number>(rows.length - 1);
  const [clickedPrizes, setClickedPrizes] = useState<string>('');

  const generateRandomCorrectPrizes = useCallback(() => {
    const randomPrizes: string[] = rows.map(row => {
      const randomIndex = Math.floor(Math.random() * row.prizes.length);
      return row.prizes[randomIndex];
    });
    setCorrectPrizes(randomPrizes);
    console.log(randomPrizes);
  }, []);

  useEffect(() => {
    generateRandomCorrectPrizes();
  }, [generateRandomCorrectPrizes]);

  const handlePrizeClick = useCallback((rowIndex: number, colIndex: number, selectedPrize: string) => {
    if (!betPlaced) {
      alert('Please place a bet before starting the game!');
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    setClickedPrizes(selectedPrize);
    setBreakingRock(true);
    setPlayerPosition({ row: rowIndex, col: colIndex, y: 0 });
  
    setTimeout(() => {
      setBreakingRock(false);
      if (!isAutoPicking && rowIndex !== currentRow) {
        console.log('You can only click the current row!');
        return;
      }
  
      if (selectedPrize === correctPrizes[rowIndex]) {
        changeState();
        if (currentRow > 0) {
          setCurrentRow(prev => prev - 1);
          setMultiplier(prev => prev * 1.5);
        } else {
          setCurrentRow(prev => prev - 1);
          alert('You have completed all rows!');
        }
      } else {
        setState(0);
        setMoney(0);
        setLost(true);
        resetState();
        setCurrentRow(rows.length - 1);
        setShowAll(true);
        setGameStarted(false);
        setMultiplier(1);
  
        const initialJump = 20;
        setPlayerPosition(prev => prev ? { ...prev, y: prev.y - initialJump } : null);
      
        setTimeout(() => {
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
                  return null;
                }
              }
              return null;
            });
          }, 50);
        }, 200);
      }
    }, 500);
  }, [betPlaced, gameStarted, isAutoPicking, currentRow, correctPrizes, changeState, setState, resetState, rows.length]);

  const AutoPick = useCallback(() => {
    if (!betPlaced) {
      alert('Please place a bet before starting the game!');
      return;
    }

    setGameStarted(true);

    let currentAutoRow = rows.length - 1;
  
    const autoPickInterval = setInterval(() => {
      setBreakingRock(true);
      setIsAutoPicking(true);
      const randomPrizeIndex = Math.floor(Math.random() * rows[currentAutoRow].prizes.length);
      const randomPrize = rows[currentAutoRow].prizes[randomPrizeIndex];
      handlePrizeClick(currentAutoRow, randomPrizeIndex, randomPrize);
      
      if (correctPrizes[currentAutoRow] !== randomPrize || lost || currentAutoRow < 0) {
        clearInterval(autoPickInterval);
        return;
      }
  
      currentAutoRow--;
    }, 1000);
  }, [betPlaced, rows, correctPrizes, lost, handlePrizeClick]);
  
  useEffect(() => {
    if (state === 1) {
      setMoney(originalMoney * 1.5);
    } else if (state === 2) {
      setMoney(originalMoney * 2.5);
    } else if (state === 3) {
      setMoney(originalMoney * 5);
    } else if (state === 4) {
      setMoney(originalMoney * 10);
    } else if (state === 5) {
      setMoney(originalMoney * 25);
    } else if (state === 6) {
      setMoney(originalMoney * 50);
    } else if (state === 7) {
      setMoney(originalMoney * 100);
    }
  }, [state, originalMoney]);

  const handlePlaceBet = () => {
    if (inputValue && parseFloat(inputValue) > 0) {
      setOriginalMoney(parseFloat(inputValue));
      setBetPlaced(true);
    } else {
      alert('Please enter a valid bet amount!');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className='py-16 flex flex-row h-fit gap-x-10 justify-center items-center'>
       <div className='absolute mt-12  top-6 right-[360px] z-50'>
       <img src="/assets/money.png" alt="" className='w-[600px]' />
       </div>
      <div className='w-[300px] relative h-[700px] bg-black rounded-sm'>
        <div className='flex gap-3 py-7 px-4'>
          <Button 
            className='w-32 bg-[#1D293B] hover:bg-[#263549] focus:bg-[#141d2a] text-white'
            onClick={() => { setIsAutoPicking(false); }}
          >
            Manual
          </Button>
          <Button 
            className='w-32 bg-[#872219] hover:bg-[#9f2a1f] focus:bg-[#6f1c14] text-white'
            onClick={() => { setIsAutoPicking(true); }}
          >
            AutoPick
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
          {isAutoPicking && (
            <Button 
              className='w-full bg-[#23C55E] hover:bg-[#31ed76]' 
              onClick={AutoPick}
              disabled={!betPlaced}
            >
              Start
            </Button>
          )}
        </div>
        <div className='py-10 px-4'>
          <h2 className='text-white'>Profit/Loss</h2>
          <h2 className='text-xl text-green-600'>${money}</h2>
        </div>
        <div className='px-4 '>
          {currentRow !== rows.length - 1 
            ? <Button className='w-full bg-green-600' onClick={() => { alert(`Checked Out with ${money}$`); }}>Checkout</Button>
            : <Button className='w-full hidden bg-green-600'>Start</Button>}
        </div>
        {gameStarted && multiplier > 1 && (
          <div className='absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[280px] h-[90px] flex flex-col items-center justify-center px-4 bg-stone-500 py-2 rounded-xl'>
            <h2 className='text-3xl font-bold text-green-500'>{multiplier.toFixed(1)}X</h2>
            <p className='text-white text-sm'>Cash out available: {(originalMoney * multiplier).toFixed(2)} tokens</p>
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
          {showAll 
            ? (
              <div className="grid grid-cols-3 grid-rows-7 gap-3">
                {rows.map((row, rowIndex) => (
                  row.prizes.map((prize, prizeIndex) => (
                    <div key={`${rowIndex}-${prizeIndex}`} className='bg-transparent'>
                      {correctPrizes[rowIndex] === prize 
                        ? <Totemrock /> 
                        : <img src={`/assets/glowLava3.png`} className="w-[124px]" alt='lava rock' />
                      }
                    </div>
                  ))
                ))}
              </div>
            )
            : (
              <div className="grid grid-cols-3 grid-rows-7 gap-3">
                {rows.map((row, rowIndex) => (
                  row.prizes.map((prize, prizeIndex) => (
                    <div key={`${rowIndex}-${prizeIndex}`} className='bg-transparent relative' onClick={() => handlePrizeClick(rowIndex, prizeIndex, prize)}>
                      {rowIndex <= currentRow 
                        ? rowIndex === currentRow 
                          ? prize === clickedPrizes && breakingRock 
                            ? <img src={`/assets/crackedBlue.png`} className="w-[124px]" alt='cracked blue rock' /> 
                            : <img src={`/assets/blueRock.png`} className="w-[124px] animate-pulse" alt='blue rock' />
                          : <img src={`/assets/basicRock.png`} className="w-[124px]" alt='basic rock' />
                        : correctPrizes[rowIndex] === prize 
                          ? <Totemrock /> 
                          : <img src={`/assets/glowLava3.png`} className="w-[124px]" alt='lava rock' />
                      }
                    </div>
                  ))
                ))}
              </div>
            )
          }
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