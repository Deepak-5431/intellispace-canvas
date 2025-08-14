"use client";

import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gql, useMutation } from "@apollo/client";

const CREATE_CANVAS_MUTATION = gql`
  mutation CreateCanvas($name: String!, $ownerId: String!) {
    createCanvas(name: $name, ownerId: $ownerId) {
      id
      name
    }
  }
`;

const DashboardPage = () => {
  const { currentUser, isLoading } = useUserStore();
  const router = useRouter();

  const [createCanvas, { loading, error }] = useMutation(CREATE_CANVAS_MUTATION);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [isLoading, currentUser, router]);

  
  const handleCreateCanvas = async () => {
    if (!currentUser) return; 

    try {
      const response = await createCanvas({
        variables: {
          name: 'Untitled Canvas',
          ownerId: currentUser.$id, 
        },
      });
      console.log('Canvas created:', response.data);
      // TODO: Redirect to the new canvas page, e.g., /canvas/${response.data.createCanvas.id}
    } catch (err) {
      console.error('Failed to create canvas:', err);
    }
  };

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-4 text-xl">Hello, {currentUser.email}!</p>
      
      <div className="mt-8">
        <button
          onClick={handleCreateCanvas}
          disabled={loading} // 4. Disable the button while loading
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create New Canvas'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">Error: {error.message}</p>}

      {/* We will add the list of existing canvases here later */}
    </div>
  );
};

export default DashboardPage;