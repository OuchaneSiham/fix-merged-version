import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8281/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getConversations = async () => {
  const res = await API.get("/chat/conversation");
  return res.data;
};

export const getMessages = async (convId) => {
  const res = await API.get(`/chat/conversation/${convId}/messages`);
  return res.data;
};

export const sendMessage = async (convId, content) => {
  const res = await API.post(`/chat/conversation/${convId}/message`, { content });
  return res.data;
};

export const blockUser = async (targetId) => {
  const res = await API.post(`/chat/user/${targetId}/block`);
  return res.data;
};
export const unblockUser = async (targetId) => {
  const res = await API.post(`/chat/user/${targetId}/unblock`);
  return res.data;
};

export const getBlockedUsers = async () => {
  const res = await API.get(`/chat/user/me/blocked`); 
  return res.data;
};