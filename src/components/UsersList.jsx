import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { API_URL } from "../constant/api";
import axios from "axios";

export default function UsersList() {
  const { token, user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter out current user
        setUsers(res.data.users.filter((u) => u._id !== user.id));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUsers();
    }
  }, [token, user.id]);

  const filteredUsers = users.filter((u) =>
    (u.fullName?.toLowerCase() || u.username.toLowerCase()).includes(
      searchQuery.toLowerCase()
    )
  );

  const startChat = async (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-700 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">New Chat</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto ">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col bg-zinc-800 items-center justify-center h-64 text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">
              {searchQuery ? "Try a different search" : "No users available"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 bg-zinc-800">
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => startChat(u._id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-900 transition cursor-pointer "
              >
                {/* Avatar */}
                {u.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {u.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-semibold text-gray-100 truncate">
                    {u.fullName || u.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">@{u.username}</p>
                  {u.email && (
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  )}
                </div>

                {/* Message Icon */}
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-full">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}