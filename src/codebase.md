# Codebase Contents

## Project Structure
```
```

## File: app/components/GamingArea.tsx
```
'use client'

import React, { useEffect, useState } from 'react';
import Totemrock from './Totemrock';
import { Button } from '@/components/ui/button';

export default function GamingArea({ changeState, resetState, state, setState }: any) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [BreakingRock, setBreakingRock] = useState<boolean>(false);
  const [isAutoPicking, setIsAutoPicking] = useState(false);
  const [lost, setLost] = useState<boolean>(false);
  const [money, setMoney] = useState<number>(0);
  const [originalMoney, setOriginalMoney] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<{ row: number; col: number; y: number } | null>(null);
  const [betPlaced, setBetPlaced] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);

  const rows = [
    { prizes: ['Prize 1A', 'Prize 1B', 'Prize 1C'] },
    { prizes: ['Prize 2A', 'Prize 2B', 'Prize 2C'] },
    { prizes: ['Prize 3A', 'Prize 3B', 'Prize 3C'] },
    { prizes: ['Prize 4A', 'Prize 4B', 'Prize 4C'] },
    { prizes: ['Prize 5A', 'Prize 5B', 'Prize 5C'] },
    { prizes: ['Prize 6A', 'Prize 6B', 'Prize 6C'] },
    { prizes: ['Prize 7A', 'Prize 7B', 'Prize 7C'] },
  ];

  const [correctPrizes, setCorrectPrizes] = useState<any>([]);
  const [currentRow, setCurrentRow] = useState<number>(rows.length - 1);
  const [clickedPrizes, setClickedPrizes] = useState('');

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

  const handlePrizeClick = (rowIndex: number, colIndex: number, selectedPrize: any) => {
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
          setCurrentRow(currentRow - 1);
          setMultiplier(prev => prev * 1.5); // Increase multiplier
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
        setGameStarted(false);
        setMultiplier(1);
  
        // Animate player falling
        const initialJump = 20;
        setPlayerPosition(prev => prev ? { ...prev, y: prev.y - initialJump } : null);
      
        // Animate player falling after a short delay
        setTimeout(() => {
          let fallDistance = 0;
          const fallAnimation = setInterval(() => {
            setPlayerPosition(prev => {
              if (prev) {
                fallDistance += 10;
                const newY = prev.y + fallDistance;
                if (newY < 700) { // Increased fall distance
                  return { ...prev, y: newY };
                } else {
                  clearInterval(fallAnimation);
                  return null;
                }
              }
              return null;
            });
          }, 50);
        }, 200); // Short delay before falling starts
      }
    }, 500);
  };
  
  const AutoPick = () => {
    if (!betPlaced) {
      alert('Please place a bet before starting the game!');
      return;
    }

    setGameStarted(true);

    let currentRow = 6;
  
    const autoPickInterval = setInterval(() => {
      setBreakingRock(true);
      setIsAutoPicking(true);
      const randomPrizeIndex = Math.floor(Math.random() * rows[currentRow].prizes.length);
      const randomPrize = rows[currentRow].prizes[randomPrizeIndex];
      handlePrizeClick(currentRow, randomPrizeIndex, randomPrize);
      
      if (correctPrizes[currentRow] !== randomPrize) {
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
          {currentRow !== 6 
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
        {/* Add this new div for the translucent black background */}
        <div 
  className='absolute inset-0 bg-black bg-opacity-50 rounded-lg -left-6 h-[700px] z-10'
  style={{ top: '-24px' }} // Adjust this value as needed
></div>
        <div className='relative z-10'>
          {showAll 
            ? (
              <div className="grid grid-cols-3 grid-rows-7 gap-3">
                {rows.map((row, rowIndex) => (
                  row.prizes.map((prize, prizeIndex) => (
                    <div key={prizeIndex} className='bg-transparent'>
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
                    <div key={prizeIndex} className='bg-transparent relative' onClick={() => handlePrizeClick(rowIndex, prizeIndex, prize)}>
                      {rowIndex <= currentRow 
                        ? rowIndex === currentRow 
                          ? prize === clickedPrizes && BreakingRock 
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
}```

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
```

## File: app/layout.tsx
```
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
        {children}
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
        src="/assets/jackpot.png" 
        alt="Jackpot" 
      />

      <div className="relative h-[800px] w-5 ml-7 mb-11 -mt-10 ">
        <Progress 
          value={percentage} 
          className="h-full w-full bg-gray-800 rounded-full [&>div]:bg-green-500 [&>div]:rounded-full"
        />
        {steps.map((step, index) => (
          <div 
            key={index}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
            style={{ bottom: `calc(${(index / (steps.length - 1)) * 100}% - 10px)` }}
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
    { value: 1, label: "0x" },
    { value: 1.5, label: "1.5x" },
    { value: 2.5, label: "2.5x" },
    { value: 5, label: "5x" },
    { value: 10, label: "10x" },
    { value: 25, label: "25x" },
    { value: 50, label: "50x" },
    { value: 100, label: "" },
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
    <div className=" min-h-screen bg-cover bg-center "
    style={{ backgroundImage: "url('/assets/background.png')" }}>
    <Navbar />
    <div className='flex relative justify-center items-center'>

      {/* <Console setIsAutoPicking = {setIsAutoPicking} setStart = {setStart} /> */}
      <GamingArea changeState = {changeState} resetState = {resetState} state = {state} setState = {setState}/>
      <VerticalProgressBar value={state*(100/7)} maxValue={100} steps={steps} />
   
  </div>
</div>
  )
}

export default Page```

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

## File: lib/utils.ts
```
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

