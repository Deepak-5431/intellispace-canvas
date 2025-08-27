"use client";

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Circle, RegularPolygon, Line } from 'react-konva';
import type Konva from 'konva';

interface CanvasEditorProps {
  shapes: any[];
  setShapes: (shapes: any[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  drawingMode: string;
  setDrawingMode: (mode: string) => void;
  selectedColor: string;
}

const CanvasEditor = ({ 
  shapes, 
  setShapes, 
  selectedId, 
  setSelectedId, 
  drawingMode, 
  setDrawingMode,
  selectedColor 
}: CanvasEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isDrawing = useRef(false);
  const currentLine = useRef<any>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (transformerRef.current && drawingMode === 'select') {
      const stage = stageRef.current;
      const selectedNode = stage?.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, drawingMode]);

  const handleDragEnd = (e: any, index: number) => {
    if (drawingMode !== 'select') return;
    
    const newShapes = [...shapes];
    newShapes[index] = {
      ...newShapes[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setShapes(newShapes);
  };

  const handleTransformEnd = (e: any, index: number) => {
    if (drawingMode !== 'select') return;
    
    const node = e.target;
    const newShapes = shapes.slice();
    
    if (node.className === 'RegularPolygon') {
      // For triangles
      newShapes[index] = {
        ...newShapes[index],
        x: node.x(),
        y: node.y(),
        radius: node.radius() * node.scaleX(),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      };
    } else if (node.className === 'Circle') {
      // For circles
      newShapes[index] = {
        ...newShapes[index],
        x: node.x(),
        y: node.y(),
        radius: node.radius() * node.scaleX(),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      };
    } else {
      // For rectangles
      newShapes[index] = {
        ...newShapes[index],
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      };
    }
    
    setShapes(newShapes);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (drawingMode === 'select') {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      }
      return;
    }
    
    if (drawingMode === 'pencil') {
      isDrawing.current = true;
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      
      currentLine.current = {
        id: Date.now().toString(),
        type: 'line',
        points: [pos.x, pos.y],
        stroke: selectedColor,
        strokeWidth: 3,
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        globalCompositeOperation: 'source-over',
      };
      
      setShapes([...shapes, currentLine.current]);
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || drawingMode !== 'pencil') return;
    
    const point = e.target.getStage()?.getPointerPosition();
    if (!point || !currentLine.current) return;
    
    // Update the current line with new points
    const newPoints = currentLine.current.points.concat([point.x, point.y]);
    const updatedShapes = shapes.map(shape => {
      if (shape.id === currentLine.current.id) {
        return {
          ...shape,
          points: newPoints
        };
      }
      return shape;
    });
    
    setShapes(updatedShapes);
    currentLine.current.points = newPoints;
  };

  const handleStageMouseUp = () => {
    if (drawingMode === 'pencil') {
      isDrawing.current = false;
      currentLine.current = null;
    }
  };

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full ">
      <Stage 
        width={size.width}
        height={size.height}
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
        onMousemove={handleStageMouseMove}
        onMouseup={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
      >
        <Layer>
          {shapes.map((shape, i) => {
            if (shape.type === 'rect') {
              return (
                <Rect
                  key={shape.id}
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  rotation={shape.rotation || 0}
                  draggable={drawingMode === 'select'}
                  onClick={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onTap={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onTransformEnd={(e) => handleTransformEnd(e, i)}
                  scaleX={shape.scaleX || 1}
                  scaleY={shape.scaleY || 1}
                />
              );
            } else if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  rotation={shape.rotation || 0}
                  draggable={drawingMode === 'select'}
                  onClick={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onTap={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onTransformEnd={(e) => handleTransformEnd(e, i)}
                  scaleX={shape.scaleX || 1}
                  scaleY={shape.scaleY || 1}
                />
              );
            } else if (shape.type === 'triangle') {
              return (
                <RegularPolygon
                  key={shape.id}
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  sides={3}
                  radius={shape.radius || 50}
                  fill={shape.fill}
                  rotation={shape.rotation || 0}
                  draggable={drawingMode === 'select'}
                  onClick={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onTap={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onTransformEnd={(e) => handleTransformEnd(e, i)}
                  scaleX={shape.scaleX || 1}
                  scaleY={shape.scaleY || 1}
                />
              );
            } else if (shape.type === 'line') {
              return (
                <Line
                  key={shape.id}
                  id={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  tension={shape.tension}
                  lineCap={shape.lineCap}
                  lineJoin={shape.lineJoin}
                  globalCompositeOperation={shape.globalCompositeOperation}
                  draggable={drawingMode === 'select'}
                  onClick={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onTap={() => drawingMode === 'select' && setSelectedId(shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                />
              );
            }
            return null;
          })}
          {drawingMode === 'select' && (
            <Transformer 
              ref={transformerRef} 
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;