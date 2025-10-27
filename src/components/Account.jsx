import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { fetchUserData } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import PopupModal from "./PopupModal";
const Account = () => {
  const { user, token, updateProfile,  updateProfileImage, logout } = useAuthStore();
  const [userPosts, setUserPosts] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
    website: "",
    location: "",
  });

  const loadPosts = async () => {
    if (!token) return;
    await fetchUserData(token, setUserPosts);
  };

  useEffect(() => {
    if (token) loadPosts();
  }, [token]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      username: user.username || "",
      fullName: user.fullName || "",
      bio: user.bio || "",
      website: user.website || "",
      location: user.location || "",
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const updateData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] && formData[key] !== user[key]) {
          updateData[key] = formData[key];
        }
      });

      const result = await updateProfile(updateData);

      if (result.success) {
        setShowEditModal(false);
        setShowOffcanvas(false);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


 const handleProfileImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result;
    try {
      setIsUploadingProfileImage(true); // start spinner
      setLoading(true);

      const result = await updateProfileImage(base64String);
      if (result.success) {
        console.log("✅ Profile image updated successfully");
      } else {
        setError(result.message || "Failed to update profile image");
      }
    } catch (err) {
      console.error("Error uploading profile image:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsUploadingProfileImage(false); // stop spinner after upload
      setLoading(false);
    }
  };
  reader.readAsDataURL(file);
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
  {/* Header */}
  <header className="max-w-6xl mx-auto p-6">
    <div className="flex flex-col md:flex-row md:items-center md:space-x-10 border-b border-gray-700 pb-8">
      {/* Profile Image */}
      <div className="flex justify-center md:justify-start mb-6 md:mb-0">
        <div className="relative group">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover ring-4 ring-blue-500/30 transition-all duration-300 group-hover:ring-blue-500/50"
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
            onClick={() => document.getElementById("profileImageInput").click()}
          >
            <i className="fas fa-camera text-2xl"></i>
          </div>
          {/* Uploading spinner */}
          {isUploadingProfileImage && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-20">
              <div className="loader border-t-2 rounded-full border-blue-500 bg-gray-100 animate-spin w-8 h-8"></div>
            </div>
          )}
          {/* Hidden file input */}
          <input
            id="profileImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            {user?.username}
          </h1>
          <button
            aria-label="profile settings"
            onClick={() => setShowOffcanvas(true)}
            className="cursor-pointer text-xl hover:text-blue-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700/50"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>

        <ul className="flex justify-center md:justify-start space-x-8 mt-4 text-base">
          <li className="hover:scale-105 transition-transform duration-200 cursor-pointer">
            <span className="font-semibold text-blue-400">{userPosts.length}</span>{" "}
            <span className="text-gray-300">posts</span>
          </li>
          <li className="hover:scale-105 transition-transform duration-200 cursor-pointer">
            <span className="font-semibold text-blue-400">{user?.followers?.length || 0}</span>{" "}
            <span className="text-gray-300">followers</span>
          </li>
          <li className="hover:scale-105 transition-transform duration-200 cursor-pointer">
            <span className="font-semibold text-blue-400">{user?.following?.length || 0}</span>{" "}
            <span className="text-gray-300">following</span>
          </li>
        </ul>

        <div className="mt-6 space-y-2 max-w-md mx-auto md:mx-0">
          {user?.fullName && (
            <p className="font-semibold text-lg">{user.fullName}</p>
          )}
          {user?.bio && <p className="text-gray-300">{user.bio}</p>}
          {user?.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-2"
            >
              <i className="fas fa-link text-sm"></i>
              <span className="truncate max-w-xs">{user.website}</span>
            </a>
          )}
          {user?.location && (
            <p className="text-gray-400 flex items-center space-x-2">
              <i className="fas fa-map-marker-alt text-sm"></i>
              <span>{user.location}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  </header>

  {/* Gallery (hidden) */}
  <main className="max-w-6xl mx-auto p-6 hidden">
    {userPosts.length === 0 ? (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📸</div>
        <p className="text-xl text-gray-400">No posts yet</p>
        <p className="text-gray-500 mt-2">Share your first moment!</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {userPosts.map((post) => {
          const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
          const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

          return (
            <div
              key={post._id}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square hover:scale-105 transition-transform duration-300"
            >
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white font-semibold text-lg space-x-6">
                <div className="flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <i className="fas fa-heart"></i>
                  <span>{likesCount}</span>
                </div>
                <div className="flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <i className="fas fa-comment"></i>
                  <span>{commentsCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </main>

  {/* Settings Offcanvas */}
  <div
    className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      showOffcanvas ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowOffcanvas(false)}
    ></div>
    <div
      className={`absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md p-6 transform transition-transform duration-300 ${
        showOffcanvas ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Settings</h2>
        <button
          className="cursor-pointer text-white text-2xl hover:text-gray-400 transition-colors duration-200"
          onClick={() => setShowOffcanvas(false)}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <button
        onClick={() => setShowEditModal(true)}
        className=" cursor-pointer w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
      >
        <i className="fas fa-edit"></i>
        <span>Edit Profile</span>
      </button>
      <button
        onClick={() => setShowLogoutModal(true)}
        className="cursor-pointer w-full mt-4 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold hover:from-red-500 hover:to-red-400 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
      >
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  </div>

  {/* Edit Profile Modal */}
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
      showEditModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => !loading && setShowEditModal(false)}
    ></div>
    <div
      className={`relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl w-[480px] max-w-[90vw] shadow-2xl transform transition-all duration-300 ${
        showEditModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Update Profile
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {[
          { field: "username", icon: "fa-user", placeholder: "Username" },
          { field: "fullName", icon: "fa-id-card", placeholder: "Full Name" },
          { field: "bio", icon: "fa-align-left", placeholder: "Bio" },
          { field: "website", icon: "fa-globe", placeholder: "Website" },
          { field: "location", icon: "fa-map-marker-alt", placeholder: "Location" },
        ].map(({ field, icon, placeholder }) => (
          <div key={field} className="relative group">
            <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200`}></i>
            <input
              name={field}
              placeholder={placeholder}
              value={formData[field]}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          className="cursor-pointer px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowEditModal(false)}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          onClick={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <i className="fas fa-check"></i>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Logout Account Modal */}
  {showLogoutModal && (
    <PopupModal
      handleLogout={handleLogout}
      showLogoutModal={showLogoutModal}
      setShowLogoutModal={setShowLogoutModal}
    />
  )}
</div>

  );
};

export default Account;