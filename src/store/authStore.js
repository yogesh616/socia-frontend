import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../constant/api";

const setAuthHeader = (token) => {
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axios.defaults.headers.common["Authorization"];
};

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  // restore from localStorage
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setAuthHeader(token);
      set({
        token,
        user: JSON.parse(user),
        isCheckingAuth: false,
      });
    } else {
      set({ isCheckingAuth: false });
    }
  },

  register: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthHeader(token);
      set({ user, token });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
  try {
    set({ isLoading: true, error: null });

    if (!email || !password) {
      set({ error: "Email and password are required" });
      return { success: false, message: "Email and password are required" };
    }

    const res = await axios.post(`${API_URL}/auth/login`, { email, password });

    const { token, user } = res.data;

    if (!token || !user) {
      set({ error: "Invalid server response" });
      return { success: false, message: "Invalid server response" };
    }

    // Save auth info
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Set default auth header
    if (typeof setAuthHeader === "function") {
      setAuthHeader(token);
    } else {
      console.warn("setAuthHeader function not defined");
    }

    set({ user, token });
    return { success: true };

  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Login failed due to network or server error";
    set({ error: message });
    return { success: false, message };
  } finally {
    set({ isLoading: false });
  }
},

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthHeader(null);
    set({ user: null, token: null, error: null });
  },

  // manually update user data
  setUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem("user", JSON.stringify(updated));
    set({ user: updated });
  },

  // update profile image
  updateProfileImage: async (imageBase64) => {
    try {
      set({ isLoading: true, error: null });
      const token = get().token;
      if (!token) throw new Error("Not authenticated");
      const res = await axios.post(`${API_URL}/auth/profileImage`, { image: imageBase64 });
      const profileImage = res.data.profileImage;
      const updated = { ...get().user, profileImage };
      localStorage.setItem("user", JSON.stringify(updated));
      set({ user: updated });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update image";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  // update user profile
  updateProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null });
      const token = get().token;
      if (!token) throw new Error("Not authenticated");
      
      const res = await axios.put(
        `${API_URL}/auth/update-profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  // get other users
  getAllUsers: async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`);
      return { success: true, users: res.data.users };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch users";
      set({ error: message });
      return { success: false, users: [] };
    }
  }
}));

export default useAuthStore;