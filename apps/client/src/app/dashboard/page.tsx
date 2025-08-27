"use client";

import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  mutation CreateCanvas($name: String!, $ownerId: String!, $ownerName: String!) {
    createCanvas(name: $name, ownerId: $ownerId, ownerName: $ownerName) {
      id
    }
  }
`;

const UPDATE_CANVAS_MUTATION = gql`
  mutation UpdateCanvas($updateCanvasInput : UpdateCanvasInput!) {
    updateCanvas(updateCanvasInput: $updateCanvasInput) {
      id
      name
    }
  }
`;

const REMOVE_CANVAS_MUTATION = gql`
  mutation RemoveCanvas($id: ID!) {
    removeCanvas(id: $id) {
      id
    }
  }
`;

const DashboardPage = () => {
  const { currentUser, isLoading: isUserLoading } = useUserStore();
  const router = useRouter();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [canvasesState, setCanvasesState] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const { data, loading: isCanvasesLoading, error: canvasesError } = useQuery(GET_USER_CANVASES, {
    variables: { ownerId: currentUser?.$id },
    skip: !currentUser,
  });

  useEffect(() => {
    if (data?.canvases) setCanvasesState(data.canvases);
  }, [data]);

  const [createCanvas, { loading: isCreating }] = useMutation(
    CREATE_CANVAS_MUTATION,
    {
      onCompleted: (data) => {
        router.push(`/canvas/${data.createCanvas.id}`);
      },
      refetchQueries: [
        { query: GET_USER_CANVASES, variables: { ownerId: currentUser?.$id } },
      ],
    }
  );

  const [updateCanvas, { loading: isRenaming }] = useMutation(UPDATE_CANVAS_MUTATION, {
    refetchQueries: [
      { query: GET_USER_CANVASES, variables: { ownerId: currentUser?.$id } },
    ],
  });

  const [removeCanvas, { loading: isDeleting }] = useMutation(REMOVE_CANVAS_MUTATION, {
    refetchQueries: [
      { query: GET_USER_CANVASES, variables: { ownerId: currentUser?.$id } },
    ],
  });

  useEffect(() => {
    if (!isUserLoading && !currentUser) {
      router.push("/login");
    }
  }, [isUserLoading, currentUser, router]);


const openCreateModal = () => {
  setCreateName("");
  setIsCreateModalOpen(true);
};

const handleCreateSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!currentUser) return;
  const name = createName?.trim() || "Untitled Canvas";
  const tempId = `temp-${Date.now()}`;

  const tempCanvas = { id: tempId, name, ownerId: currentUser.$id, updatedAt: new Date().toISOString() };
  const prev = canvasesState;
  setCanvasesState([tempCanvas, ...prev]);
  setIsCreateModalOpen(false);
  

  try {
    const response = await createCanvas({ variables: { name,
      ownerId: currentUser.$id,
      ownerName: currentUser.name || currentUser.email
    }});
    const newId = response.data.createCanvas.id;
    
    setCanvasesState(cs => cs.map(c => (c.id === tempId ? { ...c, id: newId } : c)));
    router.push(`/canvas/${newId}`);
  } catch (err) {
    console.error("Create failed:", err);
    setCanvasesState(prev);
  } 
};

  const handleRename = (canvas: any) => {
    setSelectedCanvas(canvas);
    setNewName(canvas.name);
    setIsRenameModalOpen(true);
  };

  const handleDelete = (canvasId: string) => {
    if (!window.confirm("Are you sure you want to delete this canvas?")) return;
    const prev = canvasesState;
    
    setCanvasesState(cs => cs.filter(c => c.id !== canvasId));
    removeCanvas({ variables: { id: canvasId } })
      .catch(err => {
        console.error("Delete failed:", err);
        setCanvasesState(prev);
      });
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanvas || !newName) return;
    updateCanvas({
      variables:{
        updateCanvasInput:{
          id: selectedCanvas.id,
          name: newName
        }
      }
    });
    setIsRenameModalOpen(false);
    setSelectedCanvas(null);
  };

  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRenameModalOpen) setIsRenameModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isRenameModalOpen]);

  if (isUserLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <p className="mt-4 text-xl">Hello, {currentUser.email.slice(0,10)}!</p>
        
        <div className="mt-8">
          <button
            onClick={openCreateModal}
            disabled={isCreating}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isCreating ? "Creating..." : "Create New Canvas"}
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Your Canvases</h2>
          {canvasesError && <p className="text-red-500">Error: {canvasesError.message}</p>}

          
          {isCanvasesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 bg-white/60 border border-gray-200 rounded-lg shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {canvasesState?.length === 0 ? (
                <div className="mt-6 p-8 bg-white rounded-lg border border-dashed border-gray-200 text-center">
                  <p className="text-lg font-medium text-gray-700">You don't have any canvases yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Create your first canvas to get started.</p>
                  
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {canvasesState.map((canvas: any) => (
                    <div
                      key={canvas.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition"
                    >
                      <Link href={`/canvas/${canvas.id}`} className="block">
                        
                        <div className="w-full h-36 bg-gray-50 rounded mb-3 flex items-center justify-center text-gray-300">
                          <span className="text-sm">Thumbnail</span>
                        </div>
                        <h5 className="mb-1 text-xl font-semibold tracking-tight text-gray-900 truncate">
                          {canvas.name}
                        </h5>
                      </Link>
                      
                      <div className="mt-2 text-sm text-gray-500 flex justify-between">
                        <span>{canvas.updatedAt ? new Date(canvas.updatedAt).toLocaleDateString() : "-"}</span>
                        <span>{canvas.size ? canvas.size : "-"}</span>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => handleRename(canvas)}
                          className="text-sm text-blue-600 hover:underline"
                          disabled={isRenaming || isDeleting}
                        >
                          {isRenaming ? "Renaming..." : "Rename"}
                        </button>
                        <button
                          onClick={() => handleDelete(canvas.id)}
                          className="text-sm text-red-600 hover:underline"
                          disabled={isDeleting || isRenaming}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Create Canvas</h3>
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Canvas name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Rename Canvas</h3>
            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white"
                >
                  Save
                </button>
              
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;