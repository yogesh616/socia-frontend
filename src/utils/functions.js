import axios from "axios";

async function fetchUserData(token, setUserPosts) {
  if (!token) {
    console.error("Missing token. User may not be authenticated.");
    return;
  }

  try {
    const res = await axios.get("https://socia-server-yd7t.onrender.com/api/posts/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

   
    setUserPosts(res.data);
  } catch (err) {
    if (err.response) {
      console.error("❌ Error fetching user posts:", err.response.data.message);
    } else {
      console.error("⚠️ Network or server error:", err.message);
    }
  }
}

export { fetchUserData };
