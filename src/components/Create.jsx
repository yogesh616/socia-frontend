import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/authStore";
import Loader from "../components/Loader";

const API_URL = "https://socia-server-yd7t.onrender.com/api/posts";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null); // base64 string for preview and upload
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");

  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // base64 string
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) return alert("Please provide all fields");

    try {
      setLoading(true);
      
      // Send JSON with base64 image string
      const res = await axios.post(
        API_URL,
        {
          title,
          caption,
          image, // base64 string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Post created successfully!");
      setTitle("");
      setCaption("");
      setImage(null);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">New Post</h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6">Share your thoughts with others</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Post Title"
              className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
            
          </div>
         <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Caption</label>
          <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter Post Caption"
              className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
            </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Post Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required
            />
            {image && (
              <img
                src={image}
                alt="Preview"
                className="mt-4 w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader /> : "Share"}
          </button>
        </form>
      </div>
    </div>
  );
}