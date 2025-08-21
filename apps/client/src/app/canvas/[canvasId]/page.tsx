"use client";

import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import dynamic from 'next/dynamic'; 
import { useState } from 'react';

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
    }
  }
`;

const CanvasPage = () => {
  const params = useParams();
  const canvasId = params.canvasId as string;

  const [shapes,setShapes ] = useState<any[]>([]);

  const { data, loading, error } = useQuery(GET_CANVAS_BY_ID, {
    variables: { id: canvasId },
    skip: !canvasId,
  });

  if (loading) return <div>Loading canvas...</div>;
  if (error) return <div>Error loading canvas: {error.message}</div>;
  if (!data?.canvas) return <div>Canvas not found.</div>

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="h-16 flex-shrink-0 p-4 border-b shadow-sm z-10 bg-white flex items-center">
        <h1 className="text-xl font-bold">{data.canvas.name}</h1>
      </header>
      <div className='flex flex-grow'>
      <main className="flex-grow w-full h-full">
        <CanvasEditor shapes={shapes} setShapes={setShapes}/>
      </main>
    </div>
    </div>
  );
};

export default CanvasPage;