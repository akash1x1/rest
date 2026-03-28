import axios from "axios";

export const axiosWrapper = axios.create({
  baseURL: "https://rest22.onrender.com", // ✅ FIXED
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});
