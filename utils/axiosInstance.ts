import axios from "axios";

const client = axios.create({
  baseURL: "http://192.168.100.8:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
