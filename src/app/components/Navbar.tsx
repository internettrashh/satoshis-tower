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

export default Navbar