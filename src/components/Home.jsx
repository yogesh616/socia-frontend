import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import axios from "axios";

const API_URL = "https://socia-server-yd7t.onrender.com/api/posts";

export default function Home() {
  const { token, user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPosts = async (pageNum = 1, refresh = false) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}?page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPosts = res.data.posts || [];
      const uniquePosts = refresh || pageNum === 1
        ? fetchedPosts
        : Array.from(new Set([...posts, ...fetchedPosts].map((p) => p._id))).map((id) =>
            [...posts, ...fetchedPosts].find((p) => p._id === id)
          );

      setPosts(uniquePosts);
      setPage(pageNum);
      setHasMore(pageNum < res.data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId, index) => {
    try {
      const res = await axios.post(
        `${API_URL}/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(prev => prev.map((post, i) => 
        i === index 
          ? { 
              ...post, 
              likes: res.data.likes,
              isLiked: res.data.isLiked 
            }
          : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, index) => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await axios.post(
        `${API_URL}/${postId}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(prev => prev.map((post, i) => 
        i === index 
          ? { 
              ...post, 
              comments: [...(post.comments || []), res.data.comment]
            }
          : post
      ));

      setCommentText("");
      setActiveCommentPost(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Socia 🦄
          </h1>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {posts.map((post, index) => {
          const isLiked = post.likes?.some(id => id === user?.id);
          const likesCount = post.likes?.length || 0;
          const commentsCount = post.comments?.length || 0;

          return (
            <div 
              key={post._id} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.user?.profileImage}
                    alt={post.user?.username}
                    className="w-10 h-10 rounded-full ring-2 ring-blue-500/30"
                  />
                  <div>
                    <p className="font-semibold text-white">{post.user?.username}</p>
                    {post.location && (
                      <p className="text-xs text-gray-400 flex items-center">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {post.location}
                      </p>
                    )}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <i className="fas fa-ellipsis-h"></i>
                </button>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="relative">
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full max-h-[600px] object-cover"
                  />
                </div>
              )}

              {/* Post Video */}
              {post.video && (
                <div className="relative">
                  <video
                    src={post.video}
                    controls
                    className="w-full max-h-[600px] object-cover"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post._id, index)}
                      className={`transition-all duration-200 transform hover:scale-110 ${
                        isLiked ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-2xl`}></i>
                    </button>
                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      <i className="far fa-comment text-2xl"></i>
                    </button>
                    <button className="text-white hover:text-blue-400 transition-colors">
                      <i className="far fa-paper-plane text-2xl"></i>
                    </button>
                  </div>
                  <button className="text-white hover:text-yellow-400 transition-colors">
                    <i className={`${post.isPinned ? 'fas' : 'far'} fa-bookmark text-2xl`}></i>
                  </button>
                </div>

                {/* Likes Count */}
                {likesCount > 0 && (
                  <p className="font-semibold text-white">
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                  </p>
                )}

                {/* Caption */}
                {post.caption && (
                  <div className="text-white">
                    <span className="font-semibold mr-2">{post.user?.username}</span>
                    <span className="text-gray-300">{post.caption}</span>
                  </div>
                )}

                {/* View Comments */}
                {commentsCount > 0 && activeCommentPost !== post._id && (
                  <button
                    onClick={() => setActiveCommentPost(post._id)}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  >
                    View all {commentsCount} comments
                  </button>
                )}

                {/* Comments Section */}
                {activeCommentPost === post._id && (
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="flex items-start space-x-3">
                        <img
                          src={comment.user?.profileImage}
                          alt={comment.user?.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 bg-gray-700/50 rounded-lg p-3">
                          <p className="font-semibold text-white text-sm">{comment.user?.username}</p>
                          <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500 uppercase">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Add Comment Input */}
              {activeCommentPost === post._id && (
                <div className="border-t border-gray-700/50 p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.profileImage}
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id, index)}
                      className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                      disabled={submittingComment}
                    />
                    <button
                      onClick={() => handleComment(post._id, index)}
                      disabled={!commentText.trim() || submittingComment}
                      className="text-blue-500 font-semibold disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {submittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Load More Button */}
        {hasMore && !loading && (
          <button
            onClick={handleLoadMore}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Load More Posts
          </button>
        )}

        {/* Loading Indicator */}
        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-400 py-4">
            🎉 You're all caught up!
          </p>
        )}

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl text-gray-400">No posts yet</p>
            <p className="text-gray-500 mt-2">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}