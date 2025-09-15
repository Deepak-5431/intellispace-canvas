"use client";

import { useUserStore } from "@/lib/userStore";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Bell, LogOut, User, Settings, LayoutDashboard, Mail, X, Check, Clock } from 'lucide-react';

const GET_MY_INVITATIONS = gql`
  query GetMyInvitations {
    myInvitations {
      id
      status
      fromUserId
      canvasId
      canvasName
      fromUserEmail
      expiresAt
      createdAt
    }
  }
`;


const ACCEPT_INVITATION_MUTATION = gql`
  mutation AcceptInvitation($invitationId: ID!) {
    acceptInvitation(invitationId: $invitationId) {
      id
      status
      canvasId
      fromUserId
      toUserId
    }
  }
`;

const DECLINE_INVITATION_MUTATION = gql`
  mutation DeclineInvitation($invitationId: ID!) {
    declineInvitation(invitationId: $invitationId) {
      id
      status
    }
  }
`;

const Navbar = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { currentUser, fetchUser } = useUserStore();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const { data: invitationsData, loading: invitationsLoading, error: invitationsError, refetch } = useQuery(GET_MY_INVITATIONS, {
    skip: !currentUser,
    pollInterval: 30000, 
  });

  const [acceptInvitation] = useMutation(ACCEPT_INVITATION_MUTATION, {
    onCompleted: (data) => {
      console.log("Invitation accepted:", data);
      setProcessingInvitation(null);
      refetch();
      if(data.acceptInvitation?.canvasId){
        router.push(`/canvas/${data.acceptInvitation.canvasId}`);
        alert(`Invitation accepted! Redirecting to canvas: ${data.acceptInvitation.canvasId}`);
      }else{
        alert('invitation accepted,no canvas found');
      }
    },
    onError: (error) => {
      console.error("Error accepting invitation:", error);
      setProcessingInvitation(null);
     alert(`Failed to accept invitation: ${error.message}`);
    },
  });

  const [declineInvitation] = useMutation(DECLINE_INVITATION_MUTATION, {
    onCompleted: () => {
      refetch(); 
    },
    onError: (error) => {
      console.error("Error declining invitation:", error);
    },
  });

  const pendingInvitations = invitationsData?.myInvitations?.filter(
    (inv: any) => inv.status === 'PENDING' || inv.status === 'pending'
  ) || [];

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      await fetchUser();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const getInitials = (user: { name?: string; email?: string } | null) => {
    if (!user) return "";
    if (user.name) {
      return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitation(invitationId);
    try {
      await acceptInvitation({ 
        variables: { invitationId: invitationId } 
      });
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      setProcessingInvitation(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineInvitation({ variables: { invitationId } });
    } catch (error) {
      console.error("Failed to decline invitation:", error);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleAvatarClick = () => setShowDropdown(v => !v);

  const handleLogoutClick = async () => {
    setShowDropdown(false);
    await handleLogout();
  };

  return (
    <nav className="w-full top-0 relative z-50 bg-gradient-to-r from-black via-gray-900 to-red-700 text-white shadow-lg border-b border-red-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white hover:text-red-500 transition-colors duration-200">
            IntelliSpace Canvas
          </Link>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-full hover:bg-red-800/30 transition-colors duration-200"
                    aria-label="Notifications"
                  >
                    <Bell className="h-6 w-6 text-white" />
                    {pendingInvitations.length > 0 && (
                      <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-900">
                        <span className="absolute inline-flex rounded-full h-3 w-3 bg-red-500 opacity-75 animate-ping"></span>
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-red-700 rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-red-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Notifications</h3>
                          {pendingInvitations.length > 0 && (
                            <span className="px-2 py-1 bg-red-600 text-xs rounded-full text-white">
                              {pendingInvitations.length} new
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {invitationsLoading ? (
                          <div className="p-8 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                          </div>
                        ) : invitationsError ? (
                          <div className="p-4 text-red-400 text-sm">
                            Failed to load notifications: {invitationsError.message}
                          </div>
                        ) : pendingInvitations.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No new invitations</p>
                          </div>
                        ) : (
                          pendingInvitations.map((invitation: any) => (
                            <div
                              key={invitation.id}
                              className="p-4 border-b border-red-800 last:border-b-0 hover:bg-red-900/30 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">
                                    Invitation to collaborate
                                  </p>
                                  <p className="text-xs text-gray-300 mt-1">
                                    From: {invitation.fromUserEmail ||  `User ${invitation.fromUserId?.substring(0,8)}`}
                                  </p>
                                  <p className="text-xs text-gray-300">
                                    Canvas: {invitation.canvasName || `New canva`}
                                  </p>
                                  <p className="text-xs text-yellow-400 mt-1">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleAcceptInvitation(invitation.id)}
                                    disabled={processingInvitation === invitation.id}
                                    className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded transition-colors text-white"
                                    title="Accept"
                                  >
                                    {processingInvitation === invitation.id ? (
                                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeclineInvitation(invitation.id)}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors text-white"
                                    title="Decline"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {pendingInvitations.length > 0 && (
                        <div className="p-3 bg-red-900/20 border-t border-red-700">
                          <button
                            onClick={() => router.push('/dashboard?tab=invitations')}
                            className="w-full text-center text-sm text-red-300 hover:text-red-100 transition-colors"
                          >
                            View all invitations
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleAvatarClick}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-700 to-yellow-300 text-white font-bold text-lg shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                    aria-label="Profile"
                  >
                    {getInitials(currentUser)}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-xl border border-red-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-red-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-700 hover:text-white transition-colors duration-150 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors duration-200">
                  Login
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;