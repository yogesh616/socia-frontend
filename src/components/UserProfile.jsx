import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { API_URL } from "../constant/api";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import avatar from "../assets/avatar.png";

let USER_PROFILE = "USER_PROFILE"

const Loading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-white text-xl">
      <i className="fas fa-spinner fa-spin mr-2"></i>Loading...
    </div>
  </div>
);

const ErrorMessage = ({ message, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <p className="text-red-400 text-xl mb-4">{message}</p>
      <button
        onClick={onBack}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

const UserProfile = () => {
  const { id } = useParams();
  const { token } = useAuthStore();
  const [user, setUser] = useState(() => {
    let data = localStorage.getItem(USER_PROFILE);
    return data ? JSON.parse(data) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    if (!token || !id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/auth/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        localStorage.setItem(USER_PROFILE, JSON.stringify(response.data.user))
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, id]);

  useEffect(() => {
    setFollowerCount(user?.followers?.length || 0)
    setFollowingCount(user?.following?.length || 0)
  }, [user])

 const Skeleton = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:space-x-10 border-b border-gray-700 pb-8">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={avatar}
              alt="Profile"
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover ring-4 ring-blue-500/30"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 mt-6 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-light tracking-wide">username</h1>

            <ul className="flex space-x-8 mt-6 text-base">
              <li>
                <span className="font-semibold text-blue-400">0</span>{" "}
                <span className="text-gray-300">followers</span>
              </li>
              <li>
                <span className="font-semibold text-blue-400">0</span>{" "}
                <span className="text-gray-300">following</span>
              </li>
            </ul>

           

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => navigate(`/chat/`)}
                className=" cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <i className="fas fa-comment"></i>
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
  )
 }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <header className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft />
        </button>

        { loading ? (
    <Skeleton />
) : error && !user ? (
    <ErrorMessage message={error || "User not found"} onBack={() => navigate(-1)} />
) : (
    <div className="flex flex-col md:flex-row md:items-center md:space-x-10 border-b border-gray-700 pb-8">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={user.profileImage || avatar}
              alt="Profile"
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover ring-4 ring-blue-500/30"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 mt-6 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-light tracking-wide">{user.username}</h1>

            <ul className="flex space-x-8 mt-6 text-base">
              <li>
                <span className="font-semibold text-blue-400">{followerCount}</span>{" "}
                <span className="text-gray-300">followers</span>
              </li>
              <li>
                <span className="font-semibold text-blue-400">{followingCount}</span>{" "}
                <span className="text-gray-300">following</span>
              </li>
            </ul>

            <div className="mt-6 space-y-2">
              {user.fullName && <p className="font-semibold text-lg">{user.fullName}</p>}
              {user.bio && <p className="text-gray-300">{user.bio}</p>}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
                >
                  <i className="fas fa-link text-sm"></i>
                  <span>{user.website}</span>
                </a>
              )}
              {user.location && (
                <p className="text-gray-400 flex items-center space-x-1">
                  <i className="fas fa-map-marker-alt text-sm"></i>
                  <span>{user.location}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => navigate(`/chat/${user._id}`)}
                className=" cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <i className="fas fa-comment"></i>
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
)}

       
      </header>
    </div>
  );
};

export default UserProfile;
