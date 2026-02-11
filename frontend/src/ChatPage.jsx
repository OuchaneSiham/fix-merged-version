
import React, { useEffect, useState, useCallback } from "react";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  blockUser, 
  unblockUser, 
  getBlockedUsers 
} from "./api/chatApi";
import { socket } from "./socket";
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);

  const location = useLocation();
  const user = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  const otherUser = selectedConv && (
    selectedConv.user1.id === user.id ? selectedConv.user2 : selectedConv.user1
  );

  const isBlocked = otherUser && blockedUsers.some(b => b.blockedUser.id === otherUser.id);

  const fetchBlockedUsers = async () => {
    try {
      const data = await getBlockedUsers();
      setBlockedUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
    }
  };

  const selectChat = useCallback(async (conv) => {
    setSelectedConv(conv);
    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      socket.emit("join_chat", conv.id);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const handleBlockAction = async (targetId, action) => {
    try {
      if (action === "block") {
        await blockUser(targetId);
      } else {
        await unblockUser(targetId);
      }
      await fetchBlockedUsers();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Cannot ${action} user at this time.`);
    }
  };
  useEffect(() => {
    socket.connect();

    const initialize = async () => {
      const data = await getConversations();
      setConversations(data);
      await fetchBlockedUsers();
      const params = new URLSearchParams(location.search);
      const convIdFromUrl = params.get('conv');

      if (convIdFromUrl) {
        const target = data.find(c => c.id === parseInt(convIdFromUrl));
        if (target) {
          selectChat(target);
        }
      }
    };

    initialize();

    return () => {
      socket.disconnect();
    };
  }, [location.search, selectChat]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (selectedConv && msg.conversationId === selectedConv.id) {
        setMessages((prev) => {
          const isDuplicate = prev.some(m => m.id === msg.id);
          if (isDuplicate) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new");
  }, [selectedConv]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || isBlocked) return;

    const currentInput = input;
    setInput("");

    try {
      const msg = await sendMessage(selectedConv.id, currentInput);
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInput(currentInput);
      alert(err.response?.data?.error || "Message failed. You might be blocked.");
    }
  };
  return (
    <div className="container" style={{ display: 'flex', height: '80vh', border: '1px solid #ccc' }}>
      <div className="sidebar" style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
        <h2>Chats</h2>
        {conversations.map(c => (
          <div 
            key={c.id} 
            onClick={() => selectChat(c)}
            style={{ 
              padding: '10px', 
              cursor: 'pointer', 
              backgroundColor: selectedConv?.id === c.id ? '#e0e0e0' : 'transparent',
              borderRadius: '5px',
              marginBottom: '5px'
            }}
          >
            <strong>{c.user1.id === user.id ? c.user2.username : c.user1.username}</strong>
          </div>
        ))}

        <hr style={{ margin: '20px 0' }} />
        
        <h3>Blocked Users</h3>
        {blockedUsers.length === 0 && <p style={{ fontSize: '12px', color: '#666' }}>No blocked users</p>}
        {blockedUsers.map(b => (
          <div key={b.blockedUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>{b.blockedUser.username}</span>
            <button 
              onClick={() => handleBlockAction(b.blockedUser.id, "unblock")}
              style={{ padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
      <div className="chat-area" style={{ width: '70%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
        {selectedConv ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0 }}>{otherUser?.username}</h3>
              <button 
                onClick={() => handleBlockAction(otherUser.id, isBlocked ? "unblock" : "block")}
                style={{ 
                  backgroundColor: isBlocked ? '#28a745' : '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 12px', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                {isBlocked ? "Unblock User" : "Block User"}
              </button>
            </div>
            <div className="messages" style={{ flex: 1, overflowY: 'auto', margin: '10px 0' }}>
              {messages.map(m => (
                <div 
                  key={m.id} 
                  style={{ textAlign: m.senderId === user.id ? 'right' : 'left', margin: '10px 0' }}
                >
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '8px 12px', 
                    borderRadius: '15px',
                    backgroundColor: m.senderId === user.id ? '#007bff' : '#f1f0f0',
                    color: m.senderId === user.id ? 'white' : 'black',
                    maxWidth: '70%',
                    wordBreak: 'break-word'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="input-area" style={{ display: 'flex', gap: '10px' }}>
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isBlocked}
                placeholder={isBlocked ? "You have blocked this user" : "Type a message..."} 
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button 
                onClick={handleSend} 
                disabled={isBlocked}
                style={{ padding: '10px 20px', cursor: isBlocked ? 'not-allowed' : 'pointer' }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', color: '#888' }}>Select a friend to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;