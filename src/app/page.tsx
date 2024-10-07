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
    <div className=' flex flex-col  items-centers justify-center '>
 <img className='w-20 ' src="/assets/jackpot.png" alt="" />

    <div className="relative h-[600px] w-5   ml-7">
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
          <span className="text-sm text-white font-bold">{step.label}</span>
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

export default Page