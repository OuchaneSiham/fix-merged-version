

import axios from "axios";
const BASE_URL = "http://localhost:8281/api/v1/users";

export const blockUser = (blockerId, blockedUserId) =>
  axios.post(`${BASE_URL}/${blockedUserId}/block`, { blockerId });

export const unblockUser = (blockerId, blockedId) => {
  return axios.post(`${BASE_URL}/${blockedId}/unblock`, {
    blockerId,
  });
};

export const getBlockedUsers = (userId) =>
  axios.get(`${BASE_URL}/${userId}/blocked`);