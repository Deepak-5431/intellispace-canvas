// apps/client/src/app/canvas/[canvasId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Toolbar from '@/components/canvas/Toolbar';
import { useYjs } from '@/hooks/useYjs';

const CanvasEditor = dynamic(
  () => import('@/components/canvas/CanvasEditor'),
  {
    ssr: false,
    loading: () => <p>Loading Canvas...</p>
  }
);

const GET_CANVAS_BY_ID = gql`
  query GetCanvasById($id: ID!) {
    canvas(id: $id) {
      id
      name
      canvasData
    }
  }
`;

const UPDATE_CANVAS_MUTATION = gql`
  mutation UpdateCanvas($updateCanvasInput: UpdateCanvasInput!) {
    updateCanvas(updateCanvasInput: $updateCanvasInput) {
      id
      canvasData
    }
  }
`;

const CanvasPage = () => {
  const params = useParams();
  const canvasId = params.canvasId as string;

  const { data, loading, error: queryError } = useQuery(GET_CANVAS_BY_ID, {
    variables: { id: canvasId },
    skip: !canvasId,
  });


  const { shapes, addShape, error: yjsError, isConnected, generateUniqueId, updateShapeById } = useYjs(
    canvasId,
    data?.canvas?.canvasData
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState('select');
  const [selectedColor, setSelectedColor] = useState('#808080');

  const [updateCanvas, { loading: isSaving }] = useMutation(UPDATE_CANVAS_MUTATION);

  const handleSave = async () => {
    try {
      const canvasDataString = JSON.stringify(shapes);
      await updateCanvas({
        variables: {
          updateCanvasInput: {
            id: canvasId,
            canvasData: canvasDataString,
          }
        }
      });
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Failed to save', error);
      alert('Failed to save canvas');
    }
  };

  if (loading) return <div>Loading canvas...</div>;
  if (queryError) return <div>Error loading canvas: {queryError.message}</div>;
  if (!data?.canvas) return <div>Canvas not found.</div>

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="h-16 flex-shrink-0 p-4 border-b shadow-sm z-10 bg-white flex items-center">
        <h1 className="text-xl font-bold">{data.canvas.name}</h1>
        <div className="ml-auto flex items-center gap-4">
          {yjsError && (
            <span className="text-red-500 text-sm">Error: {yjsError}</span>
          )}
          {isConnected ? (
            <span className="text-green-500 text-sm">Connected</span>
          ) : (
            <span className="text-yellow-500 text-sm">Connecting...</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      <div className='flex flex-grow h-[calc(100vh-4rem)] overflow-hidden'>
        <Toolbar
          addShape={addShape}
          generateUniqueId={generateUniqueId}
          setDrawingMode={setDrawingMode}
          drawingMode={drawingMode}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <main className="flex-grow w-full h-full relative">
          <CanvasEditor
            shapes={shapes}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            selectedColor={selectedColor}
            addShape={addShape}
            generateUniqueId={generateUniqueId}
            updateShapeById={updateShapeById}
          />
        </main>
      </div>
    </div>
  );
};

export default CanvasPage;