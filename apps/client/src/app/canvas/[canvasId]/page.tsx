"use client"

import { useParams } from "next/navigation";
import { gql, useQuery } from '@apollo/client';


const GET_CANVAS_BY_ID = gql`
  query GetCanvasById($id: ID!){
    canvas(id: $id){
      id
      name
    }
  }
`;

const CanvasPage = () => {
  const params = useParams();
  const canvasId = params.canvasId as string;

const { data,loading,error } = useQuery(GET_CANVAS_BY_ID, {
  variables: { id: canvasId},
  skip: !canvasId,
});

if(loading)return <div>Loading...</div>
if(error) return <div>error is {error.message}</div>
if(!data?.canvas) return <div> canvas unable to fetch as of now</div>

  return(
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold">Canvas :{data.canvas.name}</h1>
      <p className="mt-4">You are viewing canvas with ID: {data.canvas.id}</p>
      <p className="mt-8 font-semibold">we will have fun here</p>
    </div>
  );
};

export default CanvasPage;