"use client";

import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";

const GET_USER_CANVASES = gql`
  query GetCanvasesByOwner($ownerId: String!) {
    canvases(ownerId: $ownerId) {
      id
      name
    }
  }
`;

const CREATE_CANVAS_MUTATION = gql`
  mutation CreateCanvas($name: String!, $ownerId: String!) {
    createCanvas(name: $name, ownerId: $ownerId) {
      id
      name
    }
  }
`;

const DashboardPage = () => {
  const { currentUser, isLoading: isUserLoading } = useUserStore();
  const router = useRouter();

  // 2. Use the useQuery hook to fetch data
  const { data, loading: isCanvasesLoading, error: canvasesError } = useQuery(GET_USER_CANVASES, {
    variables: { ownerId: currentUser?.$id },
    skip: !currentUser, // Don't run the query until we know who the user is
  });

  const [createCanvas, { loading: isCreating }] = useMutation(CREATE_CANVAS_MUTATION, {
      refetchQueries: [GET_USER_CANVASES] // 3. Automatically refresh the list
  });

  useEffect(() => {
    if (!isUserLoading && !currentUser) {
      router.push('/login');
    }
  }, [isUserLoading, currentUser, router]);

  const handleCreateCanvas = async () => {
    if (!currentUser) return;
    try {
      const response = await createCanvas({
        variables: { name: 'Untitled Canvas', ownerId: currentUser.$id },
      });
      const newCanvasId = response.data.createCanvas.id;
      router.push(`/canvas/${newCanvasId}`); // 4. Redirect on success
    } catch (err) {
      console.error('Failed to create canvas:', err);
    }
  };

  if (isUserLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-4 text-xl">Hello, {currentUser.email}!</p>
      
      <div className="mt-8">
        <button
          onClick={handleCreateCanvas}
          disabled={isCreating}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isCreating ? 'Creating...' : 'Create New Canvas'}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Your Canvases</h2>
        {isCanvasesLoading && <p>Loading canvases...</p>}
        {canvasesError && <p className="text-red-500">Error loading canvases.</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {data?.canvases.map((canvas: any) => (
                <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{canvas.name}</h5>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;