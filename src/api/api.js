import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1/",
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
// Auth
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

export const getAllUsers = async () => {
  const response = await api.get("users");
  return response.data;
}

// Events

export const getAllEvents = async () => {
  const response = await api.get("events/all");
  return response.data;
};

export const getAllRegistrations = async () => {
  const response = await api.get("event/register/all");
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post("events", eventData);
  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`events/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`events/${eventId}`);
  return response.data;
};
//==========

export const getStudentProfile = async () => {
  const response = await api.get('/students/profile');
  return response.data;
};


export const updateProfile = async (profileData) => {
  const response = await api.put("students/profile", profileData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get("students/my-events");
  return response.data;
};



//venues
export const getAllVenues = async () => {
  const response = await api.get("venues");
  return response.data;
};
//============


export const registerForEvent = async (data) => {
  const response = await api.post(`event/register`, data);
  return response;
};

export const contactEmail = async (data) => {
  const response = await api.post(`email/send`, data);
  return response;
};

export const createNotification = async (data) => {
  const response = await api.post('notifications/create', data);
  return response.data;
};

//students
export const getALlstudent = async () => {
  const response = await api.get("students/all");
  return response.data;
};


//student profile page api calls
export const getStudentsCount = async () => {
  const response = await api.get("students");
  return response.data;
}

//organizer profile page api calls
export const getOrganizersCount = async () => {
  const response = await api.get("organizers");
  return response.data;
}

// Notifications API calls
export const getMyNotifications = async () => {
  const response = await api.get("notifications/my");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`notifications/${id}/read`);
  return response.data;
};