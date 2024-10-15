# Codebase Contents

## Project Structure
```
```

## File: app/components/GamingArea.tsx
```
'use client'

import React, {  useState, useCallback } from 'react';
import Totemrock from './Totemrock';
import { Button } from '@/components/ui/button';
import { ConnectButton, useConnection } from 'arweave-wallet-kit';
import { cashOut, placeBet, makeMove } from '@/lib/ao-lib';
import { Loader2 } from 'lucide-react'; // Import the loader icon

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

export default function GamingArea({  resetState,  setState }: GamingAreaProps) {
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
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const rows = 7;
  const columns = 3;

 

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
    const rowIndex = 7 - gameState.level; // Calculate the correct row index
    handlePrizeClick(rowIndex, randomColIndex);
  }, [gameState, handlePrizeClick]);

  const handlePlaceBet = async () => {
    if (!connected) {
      alert('Please connect your wallet to place a bet!');
      return;
    }
    
    if (inputValue && parseFloat(inputValue) > 0) {
      const betAmount = parseFloat(inputValue);
      setIsPlacingBet(true);
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
      } finally {
        setIsPlacingBet(false);
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
            disabled={betPlaced || isPlacingBet}
          >
            {isPlacingBet ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Bet...
              </>
            ) : betPlaced ? (
              'Bet Placed'
            ) : (
              'Place Bet'
            )}
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
```

## File: app/components/Navbar.tsx
```
import React from 'react'
import { CiMenuBurger } from "react-icons/ci";
function Navbar() {
  return (
    <div className='w-full h-12 bg-violet-900 flex px-7 items-center justify-between'>
        <div className='p-2 bg-yellow-500 rounded'>
            <CiMenuBurger className='text-black font-bold text-lg' />
        </div>

        <div>

        </div>
    </div>  
  )
}

export default Navbar```

## File: app/components/Totemrock.tsx
```
import React from 'react'

function Totemrock() {
  return (
    <div className='relative'>
         <img
            src={`/assets/basicRock.png`}
            className="w-[124px] absolute"
            alt='some image'
        />
        <img
            src={`/assets/totem.png`}
            className="w-10 absolute top-5 left-10"
            alt='some image'
        />
    </div>
  )
}

export default Totemrock```

## File: app/components/player.tsx
```
import React from 'react'

function Player() {
  return (
    <div>
      <img src="public/assets/character.png" alt="player" />
    </div>
  )
}

export default Player
```

## File: app/globals.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

.animate-shake {
  animation: shake 0.5s infinite;
}
```

## File: app/layout.tsx
```
import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css';
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { ToastContainer } from 'react-toastify';





const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_PUBLIC_KEY",
          "SIGN_TRANSACTION",
          "DISPATCH",
        ],
        ensurePermissions: true,
       
      }}
      theme={{
        displayTheme: "dark"
      }}
    >{children}<ToastContainer
    position="bottom-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    
    /></ArweaveWalletKit>
    
      </body>
    </html>
  );
}
```

## File: app/page.tsx
```
'use client'
import React, { useState } from 'react'
import Navbar from './components/Navbar'

import GamingArea from './components/GamingArea'

import { Progress } from "@/components/ui/progress"


interface ProgressBarProps {
  value: number;
  maxValue: number;
  steps: { value: number; label: string }[];
}

const VerticalProgressBar: React.FC<ProgressBarProps> = ({ value, maxValue, steps }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className='flex flex-col items-center justify-center'>
      <img 
        className='ml-6 z-10' 
        style={{
          width: '100px',
          marginTop: '20px',
          marginBottom: '20px'
        }}
        src="./assets/jackpotlogo.png" 
        alt="Jackpot" 
      />

      <div className="relative h-[700px] w-5 ml-7 mb-11 -mt-10 ">
        <Progress 
          value={percentage} 
          className="h-full w-full bg-gray-800 rounded-full [&>div]:bg-green-500 [&>div]:rounded-full"
        />
        {steps.map((step, index) => (
          <div 
            key={index}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
            style={{ bottom: `calc(${(step.value / maxValue) * 100}% - 10px)` }}
          >
            <span 
              className="text-lg text-white font-bold"
              style={{
                textShadow: `
                  -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000,
                  -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000,
                  -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000
                `
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const steps = [
  { value: 0, label: "0x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.9, label: "0.9x" },
  { value: 1.1, label: "1.1x" },
  { value: 1.2, label: "1.2x" },
  { value: 1.6, label: "1.6x" },
  { value: 1.8, label: "1.8x" },
];

function Page() {
  const [state, setState] = useState(0);

  function changeState(){
    setState(state + 1);
  }
  function resetState(){
    setState(0);
  }

  return (
    <div className="min-h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/assets/background.png')" }}>
      <Navbar />
      <div className='flex relative justify-center items-center'>
        <GamingArea changeState={changeState} resetState={resetState} state={state} setState={setState}/>
        <VerticalProgressBar value={steps[state]?.value || 0} maxValue={1.8} steps={steps} />
      </div>
    </div>
  )
}

export default Page
```

## File: codebase.sh
```
#!/bin/bash

OUTPUT_FILE="codebase.md"
rm -f "$OUTPUT_FILE"

echo "# Codebase Contents" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "Starting script at $(date)"

# Function to check if a file is a text file
is_text_file() {
    file -b --mime-type "$1" | grep -q '^text/'
}

# Function to check if a file or directory should be ignored
should_ignore() {
    local path="$1"
    
    # Always ignore .git directory and codebase.md
    [[ "$path" == ".git"* ]] && return 0
    [[ "$path" == "$OUTPUT_FILE" ]] && return 0
    
    # Check against .gitignore patterns
    if [[ -f ".gitignore" ]]; then
        while IFS= read -r pattern || [[ -n "$pattern" ]]; do
            [[ $pattern =~ ^# ]] && continue  # Skip comments
            [[ -z $pattern ]] && continue     # Skip empty lines
            if [[ "$path" == $pattern ]] || [[ "$path" == *"/$pattern"* ]]; then
                return 0
            fi
        done < ".gitignore"
    fi
    return 1
}

# Generate tree structure
echo "Generating tree structure..."
echo "## Project Structure" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
tree -I ".git|$OUTPUT_FILE" --gitignore >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "Processing files..."

process_directory() {
    local dir="$1"
    for item in "$dir"/*; do
        if [[ -d "$item" ]]; then
            if ! should_ignore "$item"; then
                process_directory "$item"
            fi
        elif [[ -f "$item" ]]; then
            local relative_path="${item#./}"
            if ! should_ignore "$relative_path" && is_text_file "$item"; then
                echo "Adding $relative_path"
                echo "## File: $relative_path" >> "$OUTPUT_FILE"
                echo '```' >> "$OUTPUT_FILE"
                cat "$item" >> "$OUTPUT_FILE"
                echo '```' >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
            fi
        fi
    done
}

process_directory "."

echo "File processing completed at $(date)"

echo "Codebase conversion complete. Output saved to $OUTPUT_FILE"
echo "Script finished at $(date)"```

## File: components/ui/alert.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```

## File: components/ui/button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## File: components/ui/input.tsx
```
/* eslint-disable  @typescript-eslint/no-explicit-any */
import * as React from "react"

import { cn } from "@/lib/utils"


const Input :any =(
  ({ className, type, ...props }:any, ref:any) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## File: components/ui/progress.tsx
```
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-green-500 transition-all"
      style={{ transform: `translateY(${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

## File: lib/ao-lib.ts
```
import { createDataItemSigner, message, result, results } from "@permaweb/aoconnect";

const gameProcessId = "ih1XlIJWNtaG_544IIHMFw9BOp3HBOQ5fwJogeIY76w";
const tokenContractId = "pEbKJIK4PnClZrB_nZUvjPVDOHhp36PkvphrhN2_lDs";
export const placeBet = async (betAmount: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await message({
      process: tokenContractId,
      tags: [
        { name: "Action", value: "Transfer" },
        { name: "Recipient", value: gameProcessId },
        { name: "Quantity", value: betAmount.toString() },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: "",
    });
    //getting gasme id from the resposn se from this
    const gameId = await getGameId();
    return gameId;
  } catch (error) {
    alert("Error placing bet:");
    throw error;
  }
};

export const makeMove = async (gameId: string, column: number) => {
  try {
    console.log("Making move with gameId:", gameId, "and column:", column + 1);
    const response = await message({
      process: gameProcessId,
      tags: [
        { name: "Action", value: "MakeMove" },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: JSON.stringify({ gameId, column: column + 1 }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Output, Messages } = await result({
      message: response,
      process: gameProcessId,
    });
    console.log("Move made. Output:", Messages);

    if (Messages && Messages.length > 0) {
      return JSON.parse(Messages[0].Data);
    }
    return null;
  } catch (error) {
    console.error("Error making move:", error);
    throw error;
  }
};

export const getGameId = async () => {
  let newGameId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cursor = null;

  while (newGameId === undefined) {
    const resultsOut = await results({
      process: gameProcessId,
      sort: "DESC",
      limit: 1,
    });

    if (resultsOut.edges && resultsOut.edges.length > 0) {
      for (const edge of resultsOut.edges) {
        if (edge.node && edge.node.Messages && edge.node.Messages.length > 0) {
          try {
            const gameData = JSON.parse(edge.node.Messages[0].Data);
            if (gameData.gameId) {
              newGameId = gameData.gameId;
              break;
            }
          } catch (error) {
            console.error("Error parsing message data:", error);
          }
        }
      }

      if (newGameId === undefined) {
        cursor = resultsOut.edges[resultsOut.edges.length - 1].cursor;
      }
    }

    if (newGameId === undefined) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return newGameId;
};
export const cashOut = async (gameId: string) => {
    try {
      const response = await message({
        process:gameProcessId, 
        tags: [
          { name: "Action", value: "CashOut" },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
        data: JSON.stringify({ gameId }),
      });
  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { Output, Messages } = await result({
        message: response,
        process: gameProcessId,
      });
  
      if (Messages && Messages.length > 0) {
        const cashOutResult = JSON.parse(Messages[0].Data);
        console.log("Cash out result:", cashOutResult);
        return cashOutResult.multiplier;
      }
      return null;
    } catch (error) {
      console.error("Error cashing out:", error);
      throw error;
    }
  };
```

## File: lib/utils.ts
```
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

