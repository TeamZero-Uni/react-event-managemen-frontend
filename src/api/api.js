import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
  withCredentials: true,
});

export const login = async (credentials) => {
    try {
        const response = await api.post("auth/login", credentials);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }   
};

export const me = async () => {
    try {
        const response = await api.get("auth/me");
        return response.data.data;
    } catch (error) {
        console.error("Fetch user error:", error);
        throw error;
    }
};

export const logout = async () => {
  try {
    await api.post("auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const response = await api.get("/events");
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export default api;
