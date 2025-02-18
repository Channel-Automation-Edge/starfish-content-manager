import { useEffect } from 'react'

const Test = () => {
    useEffect(() => {
        console.log('Test 1 mounted');
        return () => {
          console.log('Test 2 unmounted');
        };
      }
      , []);
  return (
    <div className="w-full lg:ps-64">
        <p className='text-black'>Test</p>
      
    </div>
  )
}

export default Test
