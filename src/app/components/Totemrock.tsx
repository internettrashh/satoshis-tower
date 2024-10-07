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

export default Totemrock