"use client"

import { useCallback, useState } from 'react';
import { ID } from 'appwrite';

interface ToolbarProps {
  setShapes: (updater: (prevShapes: any[]) => any[]) => void;
  setDrawingMode: (mode: string) => void;
  drawingMode: string;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const Toolbar = ({ setShapes, setDrawingMode, drawingMode, selectedColor, setSelectedColor }: ToolbarProps) => {
   
  const addShape = useCallback((type: 'rect' | 'circle' | 'triangle') => {
    setDrawingMode('select'); // Switch back to select mode after adding a shape
    
    const commonProps = {
      id: ID.unique(),
      x: Math.random() * 400, 
      y: Math.random() * 400,
      fill: selectedColor,
      rotation: 0, 
    };

    if (type === 'rect') {
      setShapes((previousShapes) => [
        ...previousShapes,
        {
          ...commonProps,
          type: 'rect', 
          width: 100,
          height: 100,  
        },
      ]);
    } else if (type === 'circle') {
      setShapes((previousShapes) => [
        ...previousShapes,
        {
          ...commonProps,
          type: 'circle',
          radius: 50,
        }
      ]);
    } else if (type === 'triangle') {
      setShapes((previousShapes) => [
        ...previousShapes,
        {
          ...commonProps,
          type: 'triangle',
          radius: 50,
        }
      ]);
    }
  }, [selectedColor, setShapes, setDrawingMode]);

  return (
    <div className="w-20 bg-gray-100 border-r p-2 flex flex-col items-center space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => setDrawingMode('select')}
          className={`w-16 h-16 border rounded shadow-sm flex items-center justify-center ${
            drawingMode === 'select' ? 'bg-blue-200' : 'bg-white hover:bg-blue-100'
          }`}
          title="Select Tool"
        >
          <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l-4 5l-3-1l-1 3l5 4l-1 3h6l-1-3l5-4-1-3-3 1-4-5z"></path>
          </svg>
        </button>
        
        <button
          onClick={() => addShape('rect')}
          className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
          title="Add Rectangle"
        >
          <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>  
        </button>
        
        <button
          onClick={() => addShape('circle')}
          className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
          title="Add Circle"
        >
          <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
        
        <button
          onClick={() => addShape('triangle')}
          className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center hover:bg-blue-100"
          title="Add Triangle"
        >
          <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12,2 22,22 2,22"></polygon>
          </svg>
        </button>
        
        <button
          onClick={() => setDrawingMode('pencil')}
          className={`w-16 h-16 border rounded shadow-sm flex items-center justify-center ${
            drawingMode === 'pencil' ? 'bg-blue-200' : 'bg-white hover:bg-blue-100'
          }`}
          title="Pencil Tool"
        >
          <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col items-center mt-4">
        <label htmlFor="color-picker" className="text-sm font-medium text-gray-700 mb-1">Color</label>
        <input 
          id="color-picker"
          type="color" 
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-16 h-10 border-gray-300 rounded-md cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Toolbar;