// apps/client/src/components/canvas/CanvasEditor.tsx
"use client";

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Circle, RegularPolygon, Line } from 'react-konva';
import type Konva from 'konva';

interface CanvasEditorProps {
  shapes: any[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  drawingMode: string;
  setDrawingMode: (mode: string) => void;
  selectedColor: string;
  addShape: (shapeData: any) => void;
}

const CanvasEditor = ({ 
  shapes, 
  selectedId, 
  setSelectedId, 
  drawingMode, 
  setDrawingMode,
  selectedColor,
  addShape
}: CanvasEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isDrawing = useRef(false);
  const currentLineId = useRef<string | null>(null); // Track by ID instead of object
  const [localShapes, setLocalShapes] = useState<any[]>([]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  // Combine Y.js shapes with local shapes for rendering
  const allShapes = [...shapes, ...localShapes];

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
  }, [selectedId, drawingMode, allShapes]);

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
      
      const newLineId = Date.now().toString();
      
      // Create line in local state for smooth drawing
      const newLine = {
        id: newLineId,
        type: 'line',
        points: [pos.x, pos.y],
        stroke: selectedColor,
        strokeWidth: 3,
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        globalCompositeOperation: 'source-over',
      };
      
      setLocalShapes(prev => [...prev, newLine]);
      currentLineId.current = newLineId; // Store just the ID
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || drawingMode !== 'pencil' || !currentLineId.current) return;
    
    const point = e.target.getStage()?.getPointerPosition();
    if (!point) return;
    
    // Update the current line with new points in LOCAL STATE (smooth)
    setLocalShapes(prev => prev.map(shape => {
      if (shape.id === currentLineId.current) { // Use the stored ID
        const newPoints = [...shape.points, point.x, point.y];
        return {
          ...shape,
          points: newPoints
        };
      }
      return shape;
    }));
  };

  const handleStageMouseUp = () => {
    if (drawingMode === 'pencil' && currentLineId.current) {
      isDrawing.current = false;
      
      // Find the completed line in local shapes
      const completedLine = localShapes.find(shape => shape.id === currentLineId.current);
      
      if (completedLine) {
        // When drawing is complete, add the final line to Y.js for collaboration
        addShape(completedLine);
      }
      
      // Clear local shapes and current line reference
      setLocalShapes([]);
      currentLineId.current = null;
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
          {allShapes.map((shape, i) => {
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