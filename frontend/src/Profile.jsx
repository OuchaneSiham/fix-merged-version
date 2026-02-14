import { API_BASE_URL } from "./config";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const urlme = `${API_BASE_URL}/users/me`;
  const urlup = `${API_BASE_URL}/users/update`;

  const [userData, setUserData] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [query, setQuery] = useState("");
  const [searchReqs, setSearchReqs] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fetchPending = async () => {
    const getToken = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_BASE_URL}/users/friends/pending`, {
        headers: { Authorization: "Bearer " + getToken },
      });
      if (resp.ok) {
        const data = await resp.json();
        setPendingReqs(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFriends = async () => {
    const getToken = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_BASE_URL}/users/friends/list`, {
        headers: { Authorization: "Bearer " + getToken },
      });
      if (resp.ok) {
        const data = await resp.json();
        setFriends(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSave = async () => {
    const getToken = localStorage.getItem("token");

    let dataToSend = {
      username: updatedData.username,
      email: updatedData.email,
    };

    if (updatedData.password && updatedData.password.trim() !== "") {
      if (
        !updatedData.currentPassword ||
        updatedData.currentPassword.trim() === ""
      ) {
        alert("Please enter your current password to change your password");
        return;
      }
      dataToSend.password = updatedData.password;
      dataToSend.currentPassword = updatedData.currentPassword;
    }

    try {
      const resp = await fetch(urlup, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + getToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (resp.ok) {
        const data = await resp.json();
        const userObj = data.user || data;
        setUserData(userObj);
        setUpdatedData({ ...userObj, password: "", currentPassword: "" });
        setEdit(false);
        alert("Profile updated successfully!");
      } else {
        const errorData = await resp.json();
        alert(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Network error. Please try again.");
    }
  };
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    const getToken = localStorage.getItem("token");

    try {
      const resp = await fetch(urlup, {
        headers: { Authorization: "Bearer " + getToken },
        method: "PATCH",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserData(data.user || data);
        alert("Avatar updated!");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const startChatWith = async (friendId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://localhost:8443/api/v1/chat/conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: friendId }),
        },
      );
      if (res.ok) {
        const conversation = await res.json();
        window.location.href = `/chat?conv=${conversation.id}`;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/users/logout`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (err) {
      console.error("HTTP logout failed", err);
    }
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSearch = async () => {
    const getToken = localStorage.getItem("token");
    if (query.length < 2) return;

    try {
      const data = await fetch(`${API_BASE_URL}/users/search?q=${query}`, {
        headers: { Authorization: "Bearer " + getToken },
      });
      const result = await data.json();
      setSearchReqs(result.data || result);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSendRequest = async (targetId) => {
    const getToken = localStorage.getItem("token");
    try {
      const resp = await fetch(
        `${API_BASE_URL}/users/friends/request/${targetId}`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + getToken },
        },
      );

      if (resp.ok) {
        alert("Friend request sent!");
        setSearchReqs([]);
        setQuery("");
      } else {
        const data = await resp.json();
        alert(data.error || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request");
    }
  };

  const handleAccept = async (reqId) => {
    const getToken = localStorage.getItem("token");
    try {
      const data = await fetch(`${API_BASE_URL}/users/accept/${reqId}`, {
        headers: { Authorization: "Bearer " + getToken },
        method: "PATCH",
      });
      if (data.ok) {
        setPendingReqs((prev) => prev.filter((r) => r.id !== reqId));
        fetchFriends();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    if (!getToken) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const resp = await fetch(urlme, {
          headers: { Authorization: "Bearer " + getToken },
        });
        console.log("Profile Fetch Status:", resp.status);
        if (resp.ok) {
          const data = await resp.json();
          setUserData(data);
          setUpdatedData({ ...data, password: "" });
        } else if (resp.status === 401) {
          console.log("Token invalid, redirecting...");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Fetch Profile Error:", err);
        setError("Network error.");
      }
    };
    fetchProfile();
    fetchPending();
    fetchFriends();
  }, [navigate]);
      useEffect(() => {
      const token = localStorage.getItem("token");
      socket.auth = { token };
      if (socket.connected) {
        socket.disconnect();
      }
      socket.connect();
      socket.on("friend:request_received", (data) => {
        console.log("📬 New friend request from:", data);
        fetchPending();
      });

      socket.on("friend:request_accepted", (data) => {
        console.log("✅ Friend request accepted:", data);
        fetchFriends();
      });

      socket.on("user:online", ({ userId }) => {
        setFriends(prev => prev.map(f => 
          f.id === userId ? { ...f, isOnline: true } : f
        ));
      });

      socket.on("user:offline", ({ userId }) => {
        setFriends(prev => prev.map(f => 
          f.id === userId ? { ...f, isOnline: false } : f
        ));
      });

      return () => {
        socket.off("friend:request_received");
        socket.off("friend:request_accepted");
        socket.off("user:online");
        socket.off("user:offline");
      };
    }, []);
  if (!userData) return <h1>Loading...</h1>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {userData.username}</h1>
      <img
        src={`https://localhost:8443${userData.avatar}`}
        alt="Avatar"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      {isEdit ? (
        <div
          style={{
            border: "1px solid blue",
            padding: "15px",
            marginTop: "10px",
          }}
        >
          <h3>Edit Profile</h3>
          <input
            type="text"
            placeholder="Username"
            value={updatedData.username}
            onChange={(e) =>
              setUpdatedData({ ...updatedData, username: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={updatedData.email}
            onChange={(e) =>
              setUpdatedData({ ...updatedData, email: e.target.value })
            }
          />

          {!userData.isGoogleUser && (
            <>
              <input
                type="password"
                placeholder="Current Password (required to change password)"
                value={updatedData.currentPassword || ""}
                onChange={(e) =>
                  setUpdatedData({
                    ...updatedData,
                    currentPassword: e.target.value,
                  })
                }
              />
              <input
                type="password"
                placeholder="New Password (leave blank to keep current)"
                value={updatedData.password || ""}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, password: e.target.value })
                }
              />
            </>
          )}

          {userData.isGoogleUser && (
            <p style={{ color: "#666", fontSize: "14px" }}>
              🔒 You signed in with Google. Password management is not
              available.
            </p>
          )}

          <p>Change Avatar:</p>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />

          <br />
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEdit(false)}>Cancel</button>
        </div>
      ) : (
        <div style={{ margin: "10px 0" }}>
          <p>Email: {userData.email}</p>
          <button onClick={() => setEdit(true)}>Edit Profile</button>
        </div>
      )}

      {userData.role === "admin" && (
        <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            borderRadius: "8px",
            marginTop: "10px",
          }}
        >
          <strong>Admin Status Verified</strong>
          <Link to="/admin">
            <button style={{ marginLeft: "10px" }}>
              Go to Admin Dashboard
            </button>
          </Link>
        </div>
      )}

      <hr />
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>🔍 Search Users</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search users by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: 1, padding: "8px" }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {searchReqs.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <h4>Search Results:</h4>
            {searchReqs.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  border: "1px solid #eee",
                  marginBottom: "5px",
                  borderRadius: "5px",
                }}
              >
                <img
                  src={`https://localhost:8443${user.avatar}`}
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%" }}
                  alt=""
                />
                <span style={{ flex: 1 }}>{user.username}</span>
                <button onClick={() => handleSendRequest(user.id)}>
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h3>Friends ({friends.length})</h3>
          {friends.length === 0 && (
            <p style={{ color: "#999" }}>
              No friends yet. Search for users to add!
            </p>
          )}
          {friends.map((fr) => (
            <div
              key={fr.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <img
                src={`https://localhost:8443${fr.avatar}`}
                width="30"
                height="30"
                style={{ borderRadius: "50%" }}
                alt=""
              />
              <span>
                {fr.username} {fr.isOnline ? "🟢" : "🔴"}
              </span>
              <button onClick={() => startChatWith(fr.id)}>Chat</button>
            </div>
          ))}
        </div>

        <div>
          <h3>Pending Requests ({pendingReqs.length})</h3>
          {pendingReqs.length === 0 && (
            <p style={{ color: "#999" }}>No pending requests</p>
          )}
          {pendingReqs.map((req) => (
            <div
              key={req.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <img
                src={`https://localhost:8443${req.requester.avatar}`}
                width="30"
                height="30"
                style={{ borderRadius: "50%" }}
                alt=""
              />
              <span style={{ flex: 1 }}>{req.requester.username}</span>
              <button onClick={() => handleAccept(req.id)}>Accept</button>
            </div>
          ))}
        </div>
      </div>
      <Link to="/game">
        <button
          style={{
            marginTop: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          🎮 Play Pong
        </button>
      </Link>

      <button
        onClick={handleLogout}
        style={{ marginTop: "30px", color: "red" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
