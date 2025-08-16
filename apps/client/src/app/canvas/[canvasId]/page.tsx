"use client"

import { useParams } from "next/navigation";

const CanvasPage = () => {
  const params = useParams();
  const canvasId = params.canvasId;

  return(
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold">Canvas Page</h1>
      <p className="mt-4">You are viewing canvas with ID: {canvasId}</p>
      <p className="mt-8 font-semibold">we will have fun here</p>
    </div>
  );
};

export default CanvasPage;