"use client";

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const CanvasEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Text text="editor i will do here" x={10} y={10} />
          <Rect x={20} y={500} width={100} height={100} fill="red" draggable />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;