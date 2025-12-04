import axios from "axios";
import Constants from "expo-constants";

// Determine base URL based on environment
const getBaseURL = () => {
  if (__DEV__) {
    // Development - using local IP
    return "http://192.168.100.8:5000/api/v1";
  } else {
    // Production - using your deployed server
    return "https://bayancoopserver.onrender.com/api/v1";
  }
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
