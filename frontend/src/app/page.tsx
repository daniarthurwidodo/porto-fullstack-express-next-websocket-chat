"use client";

import React from "react";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import { useUsers } from "@/hooks/useUsers";
import UserListSidebar from "@/components/UserListSidebar";
import ChatRoom from "@/components/ChatRoom";
import EmptyState from "@/components/EmptyState";

// Simple login modal since we already have a sophisticated AuthModal
function LoginModal({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      id="login-modal-overlay"
      className=""
      data-testid="login-modal"
    >
      <div
        id="login-backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onLogin}
      />
      <div
        id="login-modal-content"
        className="relative bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl text-blue-900 z-10 transform transition-all duration-300 ease-out"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 id="login-modal-title" className="text-2xl font-bold mb-2 text-blue-900">
            Welcome to DeepBlue Chat
          </h2>
          <p id="login-modal-description" className="text-blue-600 text-sm">
            Connect with others in real-time conversations
          </p>
        </div>

        <button
          id="enter-chat-button"
          onClick={onLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          data-testid="enter-chat-button"
        >
          Enter Chat
        </button>
      </div>
    </div>
  );
}

function ChatLayout() {
  const { selectedUser, setSelectedUser, isLoggedIn, setIsLoggedIn } = useChatContext();
  const {
    filteredUsers,
    onlineUsers,
    offlineUsers,
    searchQuery,
    setSearchQuery
  } = useUsers();

  return (
    <div id="chat-layout" className="relative flex h-screen bg-blue-50 text-blue-900" data-testid="chat-layout">
       {/* {!isLoggedIn && <LoginModal onLogin={() => setIsLoggedIn(true)} />} */}
      <UserListSidebar
        users={filteredUsers}
        onlineUsers={onlineUsers}
        offlineUsers={offlineUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedUser={selectedUser}
        onUserSelect={setSelectedUser}
      />

      <main id="main-content" className="flex-1 p-6 overflow-hidden" data-testid="main-content">
        {!selectedUser ? (
          <EmptyState
            title="Welcome to DeepBlue Chat"
            description="Select a user from the sidebar to start a private conversation."
            icon={
              <div id="welcome-icon" className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <svg
                  id="chat-icon"
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            }
          />
        ) : (
          <ChatRoom user={selectedUser} onBack={() => setSelectedUser(null)} />
        )}
      </main>

     
    </div>
  );
}

export default function Page() {
  return (
    <div id="app-root" data-testid="app">
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </div>
  );
}

/*
  NOTE: put the following CSS into your global CSS (e.g. globals.css, tailwind.css, or a CSS module)

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 9999px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
*/