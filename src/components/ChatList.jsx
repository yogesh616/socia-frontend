import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { API_URL } from "../constant/api";
import { initSocket } from "../utils/socket";
import axios from "axios";
import { messaging } from "../firebaseConfig";
import { getToken } from "firebase/messaging";

export default function ChatList() {
  const { token, user } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



const sendFcmTokenToServer = async (userId, token) => {
  try {
    const res = await axios.post(`${API_URL}/save-token`, {
      userId,
      token,
    });
    console.log("✅ Token saved:", res.data.message);
  } catch (err) {
    console.error("❌ Failed to send FCM token:", err.response?.data || err.message);
  }
};



async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPIDKEY
      });

      if (token) {
        await sendFcmTokenToServer(user.id, token);
        console.log("Token sent successfully:", token);
      } else {
        console.warn("No FCM token received.");
      }
    } else {
      console.warn("Notifications are denied by the user.");
    }
  } catch (err) {
    console.error("Error during notification permission or token retrieval:", err);
  }
}

useEffect(() => {
  requestPermission();
}, []);



  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${API_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chats:", err.message);
        setLoading(false);
      }
    };

    if (token) fetchChats();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = initSocket(token);

    socket.on("receiveMessage", (data) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === data.chat._id);
        if (chatIndex !== -1) {
          const updated = [...prevChats];
          updated[chatIndex] = {
            ...updated[chatIndex],
            lastMessage: data.message,
            updatedAt: data.message.createdAt,
          };
          const [chat] = updated.splice(chatIndex, 1);
          return [chat, ...updated];
        } else {
          return [data.chat, ...prevChats];
        }
      });
    });

    socket.on("messageSent", (data) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === data.chat._id);
        if (chatIndex !== -1) {
          const updated = [...prevChats];
          updated[chatIndex] = {
            ...updated[chatIndex],
            lastMessage: data.message,
            updatedAt: data.message.createdAt,
          };
          const [chat] = updated.splice(chatIndex, 1);
          return [chat, ...updated];
        }
        return prevChats;
      });
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
    };
  }, [token]);

  const getOtherParticipant = (chat) =>
    chat.participants.find((p) => p._id !== user.id);

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    else if (days === 1) return "Yesterday";
    else if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
    else return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };


    
  

  return (
     <div className="flex flex-col min-h-screen bg-zinc-900 text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-800 shadow-sm px-4 py-4 border-b border-zinc-700">
        <h1 className="text-2xl font-semibold text-gray-100">Messages</h1>
      </div>

      {loading && (
        <div className="flex justify-center items-center  bg-zinc-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chats...</p>
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-gray-600"
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
            <p className="text-lg font-medium text-gray-300">No conversations yet</p>
            <p className="text-sm mt-2 text-gray-500">
              Start chatting with your connections
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const lastMsg = chat.lastMessage;
              const isUnread =
                lastMsg &&
                lastMsg.sender !== user.id &&
                !lastMsg.seenBy?.includes(user.id);

              return (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/chat/${otherUser._id}`)}
                  className={`w-full flex items-center gap-3 p-4 transition-colors duration-150 cursor-pointer hover:bg-zinc-800/50 ${
                    isUnread ? "bg-zinc-800/60" : ""
                  }`}
                >
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    {otherUser.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser.username}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {otherUser.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    {/* Unread Badge */}
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-zinc-900"></span>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`truncate ${
                          isUnread
                            ? "font-semibold text-gray-100"
                            : "font-medium text-gray-300"
                        }`}
                      >
                        {otherUser.fullName || otherUser.username}
                      </h3>
                      {lastMsg && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {lastMsg ? (
                        <>
                          {lastMsg.sender === user.id && (
                            <span className="text-blue-400 text-xs">You:</span>
                          )}
                          <p
                            className={`text-sm truncate ${
                              isUnread
                                ? "text-gray-100 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            {lastMsg.content}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/users")}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
        title="New Chat"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
