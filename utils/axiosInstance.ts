import axios from "axios";
import { store } from "@/redux/store";
import { refreshSession } from "@/redux/slices/authSlice";

// Determine base URL based on environment
const getBaseURL = () => {
  if (__DEV__) {
    // Development - using local IP
    return "http://192.168.1.62:5000/api/v1";
  } else {
    // Production - using your deployed server
    return "https://bayancoopserver.onrender.com/api/v1";
  }
};

const baseURL = getBaseURL();

const client = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.access_token;

    if (token) {
      const cleanToken = token
        .toString()
        .replace(/^"+|"+$/g, "")
        .replace(/[\n\r]/g, "")
        .trim();

      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth.refresh_token;

        const response = await axios.post(`${baseURL}/auth/refresh-session`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;

        // Update tokens only
        store.dispatch(
          refreshSession({
            access_token: access_token,
            refresh_token: refresh_token,
          })
        );

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return client(originalRequest);
      } catch (err) {
        console.log("❌ Refresh failed");
      }
    }
  }
);

export default client;
