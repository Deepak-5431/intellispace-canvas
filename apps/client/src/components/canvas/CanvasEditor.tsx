"use client";

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Circle,RegularPolygon } from 'react-konva';
import type Konva from 'konva';


interface CanvasEditorProps {
  shapes: any[];
  setShapes: (shapes: any[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const CanvasEditor = ({ shapes, setShapes, selectedId, setSelectedId }: CanvasEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (containerRef.current) {
      setSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage?.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleDragEnd = (e: any, index: number) => {
    const newShapes = [...shapes];
    newShapes[index] = {
      ...newShapes[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setShapes(newShapes);
  };


  const handleTransformEnd = (e: any, index: number) => {
    const node = e.target;
    const newShapes = shapes.slice();
    newShapes[index] = {
      ...newShapes[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
    };
    setShapes(newShapes);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full ">
      <Stage 
        width={size.width}
        height={size.height}
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {shapes.map((shape, i) => {
            if (shape.type === 'rect') {
              return (
                <Rect
                  key={shape.id}
                  id={shape.id} // Use a unique ID for selection
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onTap={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onTransformEnd={(e) => handleTransformEnd(e, i)}
                />
              );
            } else if (shape.type == 'circle') {
              return (
                <Circle
                  key={shape.id}
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  rotation={shape.rotation}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onTap={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onTransformEnd={(e) => handleTransformEnd(e, i)}
                />
              );
            } else if(shape === 'RegularPolygon'){
              return(
                <RegularPolygon
 sides={3}
  radius={size}
                />
              )
            }
            return null;
          })}
          <Transformer ref={transformerRef} 
          boundBoxFunc={(oldBox,newBox) => {
            if(newBox.width<5 || newBox.height < 5){
              return oldBox;
            }
            return newBox;
          }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;