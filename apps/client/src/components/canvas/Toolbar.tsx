"use client"


import { useCallback, useState } from 'react';
import { ID }  from 'appwrite';

interface ToolbarProps {
  setShapes: (updater:( prevShapes: any[]) => any[]) => void;
}



const Toolbar = ({ setShapes}: ToolbarProps) => {
  const[selectedColor,setSelectedColor ] = useState('#3B82F6');
   
  const addShape = useCallback((type: 'rect'| 'circle' | 'triangle') => {

    const commonProps = {
    id: ID.unique(),
     x: Math.random() * 400, 
        y: Math.random() * 400,
        fill: selectedColor,
      rotation: 0, 
    }
    if(type === 'rect'){
    setShapes((previousShapes) => [
      ...previousShapes,
    
      {
       ...commonProps,
       type: 'rect', 
       width: 100,
       height: 100,  
      },
    ]);
    }else if(type === 'circle'){
      setShapes((previousShapes) => [
          ...previousShapes,
      
          {
            ...commonProps,
            type:'circle',
            radius: 50,
          }
        ]);
      }else if(type === 'triangle'){
        setShapes((previousShapes) => [
          ...previousShapes,
          {
            ...commonProps,
            type:'triangle',

          }
        ])
      }
  
},[selectedColor,setShapes]);

  return(
    <div className="w-20 bg-gray-100 border-r p-2 flex flex-col items-center  space-y-2">
       <div className="flex flex-col items-center space-y-2">
      <button
        onClick={ () => addShape('rect')}
        className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
        title="Add Rectangle"
        >
        <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>  
      </button>
      <button
       onClick={()=>addShape('circle')}
       className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
          title="Add Circle"
      >
<svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
          </svg>
      </button>
    </div>
     <div className="flex flex-col items-center">
        <label htmlFor="color-picker" className="text-sm font-medium text-gray-700">Color</label>
        <input 
          id="color-picker"
          type="color" 
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="mt-1 w-16 h-10 border-gray-300 rounded-md cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Toolbar;