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
