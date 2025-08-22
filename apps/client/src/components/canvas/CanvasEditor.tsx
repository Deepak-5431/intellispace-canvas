"use client";

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

interface CanvasEditorProps{
  shapes: any[];
  setShapes: (shapes:any[]) => void;
}

const CanvasEditor = ({shapes,setShapes}: CanvasEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size,setSize]  = useState({width:0,height:0});
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleDragEnd = (e:any, index: number) => {
    const newShapes  = [...shapes];
    newShapes[index] = {
    ...newShapes[index],
    x: e.target.x(),
    y: e.target.y(),
  };
  setShapes(newShapes);
};

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full ">
      <Stage width={size.width} height={size.height}>
        <Layer>
          {shapes.map((shape,i) =>{
            if(shape.type === 'rect'){
            return(
            <Rect
            key={i}
            x={shape.x}
            y={shape.y}
            width={100}
            height={100}
            fill={shape.fill} 
            draggable
            onDragEnd={(e)=> handleDragEnd(e,i)}
            />
            );
          }
          return null;
          })}
         </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;