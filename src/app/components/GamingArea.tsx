/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Totemrock from './Totemrock';
import { Button } from '@/components/ui/button';

function GamingArea({ changeState, resetState, state, setState }: any) {

  const [showAll, setShowAll] = useState<boolean>(false);
  const [BreakingRock, setBreakingRock] = useState<boolean>(false);
  const [isAutoPicking, setIsAutoPicking] = useState(false);
  const [lost, setLost] = useState<boolean>(false);
  const [money, setMoney] = useState<number>(0);
  const [originalMoney, setOriginalMoney] = useState<number>(0);

  const rows = [
    { prizes: ['Prize 1A', 'Prize 1B', 'Prize 1C'] },
    { prizes: ['Prize 2A', 'Prize 2B', 'Prize 2C'] },
    { prizes: ['Prize 3A', 'Prize 3B', 'Prize 3C'] },
    { prizes: ['Prize 4A', 'Prize 4B', 'Prize 4C'] },
    { prizes: ['Prize 5A', 'Prize 5B', 'Prize 5C'] },
    { prizes: ['Prize 6A', 'Prize 6B', 'Prize 6C'] },
    { prizes: ['Prize 7A', 'Prize 7B', 'Prize 7C'] },
  ];

 

  const AutoPick = () => {
    
    let currentRow = 6;
  
    const autoPickInterval = setInterval(() => {

     setBreakingRock(true)
      setIsAutoPicking(true);
      const randomPrizeIndex = Math.floor(Math.random() * rows[currentRow].prizes.length);
      const randomPrize = rows[currentRow].prizes[randomPrizeIndex];
      handlePrizeClick(currentRow, randomPrize);
      if(correctPrizes[currentRow] != randomPrize) {
        setBreakingRock(true)
    
        setState(0);
        setMoney(0);
        setLost(true);
        resetState();
        setCurrentRow(rows.length - 1);
        setShowAll(true);
        alert('You have lost the game!');
        clearInterval(autoPickInterval);

        return;
      }
     
      if (lost || currentRow < 0) {
        clearInterval(autoPickInterval);
        return;
      }

      currentRow--;
    }, 1000);
  };

  const [correctPrizes, setCorrectPrizes] = useState<any>([]);
  const [currentRow, setCurrentRow] = useState<number>(rows.length - 1);

  const generateRandomCorrectPrizes = () => {
    const randomPrizes: any = rows.map(row => {
      const randomIndex = Math.floor(Math.random() * row.prizes.length);
      return row.prizes[randomIndex];
    });
    setCorrectPrizes(randomPrizes);
    console.log(randomPrizes);
  };

  useEffect(() => {
 
    generateRandomCorrectPrizes();
  }, []);

  const [clickedPrizes, setClickedPrizes] = useState('');


  const handlePrizeClick = (rowIndex: number, selectedPrize: any) => {


    setClickedPrizes(selectedPrize);
    setBreakingRock(true);

    setTimeout(() => {

      setBreakingRock(false);
      if (!isAutoPicking) {
        if (rowIndex !== currentRow) {
          console.log('You can only click the current row!');
          return;
        }
      }

      if (selectedPrize === correctPrizes[rowIndex]) {
        changeState();
        if (currentRow > 0) {
          setCurrentRow(currentRow - 1);
        } else {
          setCurrentRow(currentRow - 1);
          alert('You have completed all rows!');
        }
      } else {

        setState(0);
        setMoney(0);
        setLost(true);
        resetState();
        setCurrentRow(rows.length - 1);
        setShowAll(true);
        clearTimeout(1)
        return
      }
    }, 500);
  };

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
  }, [state]);


  return (
    <div className='py-16 flex flex-row h-fit gap-x-10 justify-center items-center'>
      <div className='absolute top-2 right-[360px] '>
        <img src="/assets/money.png" alt="" className='w-[600px]' />
      </div>
      <div className='w-[300px] relative h-[700px] bg-black rounded-sm'>
        <div className='flex gap-3 py-7 px-4'>
          <Button className='w-32 focus:bg-[#1D293B] bg-[#04091A]' onClick={() => { setIsAutoPicking(false); }}>Manual</Button>
          <Button className='w-32 focus:bg-[#1D293B] bg-[#04091A]' onClick={() => { setIsAutoPicking(true); }}>AutoPick</Button>
        </div>
        <div className='px-4 flex flex-col gap-4'>
          <h2 className='font-medium text-white'>Bet amount</h2>
          <input 
            type="number" 
            onChange={(e: any) => { setOriginalMoney(e.target.value); }} 
            placeholder="Enter amount" 
            className='bg-[#556478] border-[#4B5563] text-white rounded py-5 flex h-9 w-full border border-input bg-transparent px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
          />
          {isAutoPicking && <Button className='w-full bg-[#23C55E] hover:bg-[#31ed76]' onClick={AutoPick}>Start</Button>}
        </div>
        <div className='py-10 px-4'>
          <h2 className='text-white'>Profit/Loss</h2>
          <h2 className='text-xl text-green-600'>${money}</h2>
        </div>
        <div className='px-4 '>
          {currentRow !== 6 
            ? <Button className='w-full bg-green-600' onClick={() => { alert(`Checked Out with ${money}$`); }}>Checkout</Button>
            : <Button className='w-full hidden bg-green-600'>Start</Button>}
        </div>
        <div className='absolute bottom-5 w-full flex gap-x-8 items-center justify-center px-4'>
          <img src="/assets/character.png" alt="" className='w-12 animation-pulse' />
          <h2 className='text-white'>Click one of the<br /> blue tiles to start</h2>
        </div>
      </div>

      <div className='p-2 w-[480px] mr-28'>
        {showAll 
          ? <div className="grid grid-cols-3 grid-rows-7 gap-3">
              {rows.map((row, rowIndex) => (
                row.prizes.map((prize, prizeIndex) => (
                  <div key={prizeIndex} className='bg-transparent'>
                    {correctPrizes[rowIndex] === prize 
                      ? <Totemrock /> 
                      : <img src={`/assets/glowLava3.png`} className=" w-[124px]" alt='some image' />
                    }
                  </div>
                ))
              ))}
            </div> 
          : <div className="grid grid-cols-3 grid-rows-7 gap-3">
              {rows.map((row, rowIndex) => (
                row.prizes.map((prize, prizeIndex) => (
                  <div key={prizeIndex} className='bg-transparent' onClick={() => handlePrizeClick(rowIndex, prize)}>
                    {rowIndex <= currentRow 
                      ? rowIndex === currentRow 
                        ? prize === clickedPrizes && BreakingRock 
                          ? <img src={`/assets/crackedBlue.png`} className="w-[124px]" alt='some image' /> 
                          : <img src={`/assets/blueRock.png`} className="w-[124px] animate-pulse" alt='some image' />
                        : <img src={`/assets/basicRock.png`} className="w-[124px]" alt='some image' />
                      : correctPrizes[rowIndex] === prize 
                        ? <Totemrock /> 
                        : <img src={`/assets/glowLava3.png`} className="w-[124px] " alt='some image' />
                    }
                  </div>
                ))
              ))}
            </div>
        }
      </div>
    </div>
  );
}

export default GamingArea;
