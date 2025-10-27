import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

function DarkToggle() {
  const toggle = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("dark", "false");
    } else {
      html.classList.add("dark");
      localStorage.setItem("dark", "true");
    }
  };

  React.useEffect(() => {
    const pref = localStorage.getItem("dark");
    if (pref === "true") document.documentElement.classList.add("dark");
  }, []);





  return (
    <button
      onClick={toggle}
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
    >
      Toggle Dark
    </button>
  );
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
  const navigate = useNavigate();

  // redirect based on auth state
  useEffect(() => {
    if (!isCheckingAuth) {
      if (user) navigate("/profile", { replace: true });
      else navigate("/login", { replace: true });
    }
  }, [user, isCheckingAuth, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="max-w-3xl mx-auto p-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Socia</h1>
        <div className="flex items-center gap-4">
          <nav className="flex gap-3">
            <Link to="/" className="text-sm">Home</Link>
            {!user && <Link to="/login" className="text-sm">Login</Link>}
            {!user && <Link to="/register" className="text-sm">Register</Link>}
            {user && <Link to="/profile" className="text-sm">Profile</Link>}
          </nav>
          <DarkToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          {isCheckingAuth ? (
            <p className="animate-pulse text-gray-500">Checking authentication...</p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Lightweight auth demo — uses your server routes at <code>/api/auth/*</code>.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
