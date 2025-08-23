"use client"


import { useState } from 'react';
import { ID }  from 'appwrite';

interface ToolbarProps {
  setShapes: (updater:( prevShapes: any[]) => any[]) => void;
}



const Toolbar = ({ setShapes}: ToolbarProps) => {
  const addRectangle = () => {
    setShapes((previousShapes) => [
      ...previousShapes,
      {
       type: 'rect',
        x: Math.random() * 400, 
        y: Math.random() * 400,
      width: 100,
      height: 100,
      fill: '#3B82F6' 
      },
    ]);
  };

  return(
    <div className="w-20 bg-gray-100 border-r p-2 flex flex-col items-center  space-y-2">
      <button
        onClick={addRectangle}
        className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
        title="Add Rectangle"
        >
        <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>  
      </button>
    </div>
  );
};

export default Toolbar;