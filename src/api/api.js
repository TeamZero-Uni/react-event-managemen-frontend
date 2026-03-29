import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1/",
  withCredentials: true,
  timeout: 10_000,
});

export default api;

export const login = async (credentials) => {
  const response = await api.post("auth/login", credentials);
  return response.data;
};

export const me = async () => {
  const response = await api.get("auth/me");
  return response.data.data;
};

export const logout = async () => {
  await api.post("auth/logout");
};

export const getAllEvents = async () => {
  const response = await api.get("events");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("students/profile", profileData);
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get("students/my-events");
  return response.data;
};
export const createEvent = async (eventData, token) => {
  const response = await api.post("events", eventData, {
    headers: {
      Authorization: "Bearer " + token
    }
  });
  return response.data;
};