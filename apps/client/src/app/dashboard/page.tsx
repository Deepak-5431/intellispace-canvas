"use client";

import { useUserStore } from "@/lib/userStore";
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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

const GET_ALL_USERS = gql`
  query GetUsers {
   users{
    users{
      id,
      email
    }
   }
  }
`

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

interface User {
  id: string;
  email: string;
}

interface Canvas {
  id: string;
  name: string;
  updatedAt?: string;
  size?: string;
}

const DashboardPage = () => {
  const { currentUser, isLoading: isUserLoading } = useUserStore();
  const router = useRouter();
  const [isShareModalOpen,setIsShareModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [canvasesState, setCanvasesState] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { data, loading: isCanvasesLoading, error: canvasesError } = useQuery(GET_USER_CANVASES, {
    variables: { ownerId: currentUser?.$id },
    skip: !currentUser,
  });

  const { data: usersData, loading: isUsersLoading } = useQuery<{ users: { users: User[] } }>(GET_ALL_USERS, {
  skip: !isShareModalOpen,
});
  
  useEffect(() => {
  const handleClickOutsideShareModal = (event: MouseEvent) => {
    const shareModal = document.querySelector('[data-share-modal]');
    if (shareModal && !shareModal.contains(event.target as Node)) {
      setIsShareModalOpen(false);
    }
  };

  if (isShareModalOpen) {
    document.addEventListener('mousedown', handleClickOutsideShareModal);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutsideShareModal);
  };
}, [isShareModalOpen]);

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
      const response = await createCanvas({
        variables: {
          name,
          ownerId: currentUser.$id,
          ownerName: currentUser.name || currentUser.email
        }
      });
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
      variables: {
        updateCanvasInput: {
          id: selectedCanvas.id,
          name: newName
        }
      }
    });
    setIsRenameModalOpen(false);
    setSelectedCanvas(null);
  };


  const handleShare = (canvas: Canvas) => {
    setActiveMenu(null);
    setSelectedCanvas(canvas);
    setIsShareModalOpen(true);

  };

  const handleInvite = (userId: string) => {
    alert(`Invitation sent for canvas "${selectedCanvas?.name}" to user ID: ${userId}`);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isRenameModalOpen) setIsRenameModalOpen(false);
      if (isShareModalOpen) setIsShareModalOpen(false);
    }
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [isRenameModalOpen, isShareModalOpen]); 

  if (isUserLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <p className="mt-4 text-xl">Hello, {currentUser.email.slice(0, 10)}!</p>

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
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition relative group"
                    >
                      {/* Three-dots menu button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === canvas.id ? null : canvas.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </button>

                        {/* Dropdown menu */}
                        {activeMenu === canvas.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1"
                          >
                            <button
                              onClick={() => handleShare(canvas)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Share
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                handleRename(canvas);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                handleDelete(canvas.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

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
     
{isShareModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" data-share-modal>
      <h3 className="text-lg font-bold mb-2">Share "{selectedCanvas?.name}"</h3>
      <p className="text-sm text-gray-600 mb-4">Select a user to invite them to collaborate.</p>
      
      {isUsersLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ul className="max-h-60 overflow-y-auto space-y-2">
          {usersData?.users?.users
            ?.filter((user: User) => user.id !== currentUser?.$id)
            .map((user: User) => (
              <li key={user.id} className="flex justify-between items-center p-2 border rounded-md">
                <span className="text-gray-800">{user.email}</span>
                <button 
                  onClick={() => handleInvite(user.id)} 
                  className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-green-600 transition-colors"
                >
                  Invite
                </button>
              </li>
            ))}
        </ul>
      )}
      
      <div className="flex justify-end mt-4">
        <button 
          type="button" 
          onClick={() => setIsShareModalOpen(false)} 
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default DashboardPage;