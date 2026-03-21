import axios from "axios";

export const axiosWrapper = axios.create({
  baseURL: "https://rest-vj63.onrender.com", // 🔥 YOUR BACKEND URL
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});
