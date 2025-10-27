import React, { useState } from "react";
import useAuthStore from "../store/authStore";
import Home from "./Home";
import Create from "./Create";
import Account from "./Account";
import ChatList from "./ChatList";
import { HomeIcon, PlusSquare, UserCircle, MessageSquare, LogOut } from "lucide-react";

export default function Profile() {
  const { user, updateProfileImage } = useAuthStore();
  const [activeTab, setActiveTab] = useState("chat");

  if (!user) return <div className="p-6 text-center text-gray-700 dark:text-gray-300">Please login</div>;

  const handleLogout = () => {
    logout();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const res = await updateProfileImage(base64);
      if (res.success) {
        // updated in store
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      
      case "account":
        return <Account />;
      case "chatlist":
        return <ChatList />;
      default:
        return <ChatList />;
    }
  };

  const tabs = [
   // { id: "home", icon: <HomeIcon size={22} />, label: "Home" },
   // { id: "create", icon: <PlusSquare size={22} />, label: "Create" },
    { id: "chatlist", icon: <MessageSquare size={22} />, label: "Chats" },
    { id: "account", icon: <UserCircle size={22} />, label: "Account" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Main content area */}
      <div className="flex-1 w-full transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex justify-around py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                activeTab === tab.id
                  ? "text-red-600 dark:text-red-500 scale-110"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-400 dark:hover:text-red-300"
              }`}
            >
              <span className="transition-transform duration-200">{tab.icon}</span>
              <span className="text-[11px]">{tab.label}</span>
            </button>
          ))}

         
        </div>
      </footer>
    </div>
  );
}
