"use client";

import { useParams } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Toolbar from '@/components/canvas/Toolbar';

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

  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState('select');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  const { data, loading, error } = useQuery(GET_CANVAS_BY_ID, {
    variables: { id: canvasId },
    skip: !canvasId,
    onCompleted: (data) => {
      if (data?.canvas?.canvasData) {
        setShapes(JSON.parse(data.canvas.canvasData));
      }
    }
  });

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
  if (error) return <div>Error loading canvas: {error.message}</div>;
  if (!data?.canvas) return <div>Canvas not found.</div>

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="h-16 flex-shrink-0 p-4 border-b shadow-sm z-10 bg-white flex items-center">
        <h1 className="text-xl font-bold">{data.canvas.name}</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='ml-auto bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400'
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>
      <div className='flex flex-grow h-[calc(100vh-4rem)] overflow-hidden'>
        <Toolbar 
          setShapes={setShapes} 
          setDrawingMode={setDrawingMode}
          drawingMode={drawingMode}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <main className="flex-grow w-full h-full relative">
          <CanvasEditor 
            shapes={shapes} 
            setShapes={setShapes}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            selectedColor={selectedColor}
          />
        </main>
      </div>
    </div>
  );
};

export default CanvasPage;