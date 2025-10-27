import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../utils/socket";
import useAuthStore from "../store/authStore";
import { API_URL } from "../constant/api";
import axios from "axios";
import "../App.css";
import { ArrowLeft } from "lucide-react";

export default function ChatScreen() {
  const { id: receiverId } = useParams();
  const { token, user } = useAuthStore();

  const [socket, setSocket] = useState(null);
  const [chat, setChat] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const navigate = useNavigate();

  // Initialize chat and fetch data
  const initChat = async () => {
      try {
        setLoading(true);
        
        // Start or get existing chat
        const chatRes = await axios.post(
          `${API_URL}/chats/start/${receiverId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const chatData = chatRes.data;
        setChat(chatData);
        
        // Get receiver info from participants
        const receiverData = chatData.participants.find(p => p._id !== user.id);
        setReceiver(receiverData);

        // Fetch existing messages
        const messagesRes = await axios.get(
          `${API_URL}/chats/${chatData._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMessages(messagesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing chat:", err.message);
        setLoading(false);
      }
    };

  useEffect(() => {
    
    if (token && receiverId) {
      initChat();
    }
  }, [token, receiverId, user.id]);

  // Setup socket connection
  useEffect(() => {
    if (!token || !chat) return;

    const s = initSocket(token);
    setSocket(s);

    // Listen for incoming messages
    s.on("receiveMessage", (data) => {
      if (data.message.chatId === chat._id) {
        setMessages((prev) => [...prev, data.message]);
        
        // Mark as seen immediately if chat is open
        s.emit("seenMessage", { chatId: chat._id });
      }
    });

    // Listen for message sent confirmation
    s.on("messageSent", (data) => {
      if (data.message.chatId === chat._id) {
        // Update optimistic message with server data
        setMessages((prev) => {
          const filtered = prev.filter(m => !m._tempId);
          return [...filtered, data.message];
        });
      }
    });

    // Listen for deleted messages
    s.on("messageDeleted", (data) => {
      if (data.chatId === chat._id) {
        setMessages((prev) => prev.filter(m => m._id !== data.messageId));
      }
    });

    // Listen for typing indicator
    s.on("userTyping", (data) => {
      if (data.chatId === chat._id && data.senderId === receiverId) {
        setIsTyping(data.isTyping);
        
        // Auto-hide typing after 3 seconds
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    // Listen for seen messages
    s.on("messagesSeen", (data) => {
      if (data.chatId === chat._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender._id === user.id
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    });

    // Mark messages as seen on mount
    s.emit("seenMessage", { chatId: chat._id });

    return () => {
      s.off("receiveMessage");
      s.off("messageSent");
      s.off("messageDeleted");
      s.off("userTyping");
      s.off("messagesSeen");
    };
  }, [token, chat, receiverId, user.id]);

  const handleTyping = () => {
    if (!socket || !chat) return;

    // Emit typing start
    socket.emit("typing", { 
      receiverId, 
      chatId: chat._id,
      isTyping: true 
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { 
        receiverId, 
        chatId: chat._id 
      });
    }, 2000);
  };

  const sendMessage = () => {
    if (!message.trim() || !socket || !chat) return;

    const tempId = `temp_${Date.now()}`;
    
    // Optimistic UI update
    const optimisticMessage = {
      _tempId: tempId,
      content: message.trim(),
      sender: { 
        _id: user.id, 
        username: user.username,
        profileImage: user.profileImage 
      },
      chatId: chat._id,
      createdAt: new Date().toISOString(),
      sending: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      receiverId,
      content: message.trim(),
      messageType: "text"
    });

    // Stop typing indicator
    socket.emit("stopTyping", { receiverId, chatId: chat._id });

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = (messageId) => {
    if (!socket) return;
    socket.emit("deleteMessage", { messageId });
  };

 

  if (!receiver || !chat) {
    return (
      <div className="flex bg-zinc-900 flex-col gap-4justify-center items-center h-screen text-gray-600">
        <p>Chat not found</p>
        <button onClick={initChat} className=" 
        bg-gray-700 text-shadow-indigo-400 px-4 py-2 rounded-2xl cursor-pointer
        ">Try again</button>
      </div>
    );
  }

  

  const goToUserProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-200 font-medium cursor-pointer"
        >
        <ArrowLeft />
        </button>
        <div className="cursor-pointer flex items-center gap-3" onClick={() =>goToUserProfile(receiverId)}>
          {receiver.profileImage && (
            <img
              src={receiver.profileImage}
              alt={receiver.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
       <div className="text-center flex items-center justify-between gap-4 min-w-[200px]">
  <h2 className="text-lg font-semibold text-gray-100">
    {receiver.fullName || receiver.username}
  </h2>

  {/* Typing indicator container */}
  <div className="w-16 h-6 flex justify-center items-center gap-1">
    {isTyping && (
      <>
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          ></span>
        ))}
      </>
    )}
  </div>
</div>



        </div>
        <div className="w-16"></div>
      </div>
      
      {/* Loading */}
       {loading && (
        <div className="flex justify-center items-center  bg-zinc-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender._id === user.id;
            return (
              <div
                key={msg._id || msg._tempId || index}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col max-w-xs">
                  <div
                    className={`rounded-2xl px-4 py-2 break-words ${
                      isOwn
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    } ${msg.sending ? "opacity-60" : ""}`}
                    onDoubleClick={() => isOwn && msg._id && deleteMessage(msg._id)}
                  >
                    {msg.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {isOwn && msg.seen && " ✓✓"}
                    {isOwn && msg.sending && " ⏳"}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center p-3 bg-zinc-800 border-t">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border text-white bg-zinc-700 border-zinc-600 rounded-full focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="cursor-pointer ml-3 bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}