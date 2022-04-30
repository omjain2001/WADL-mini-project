import axios from "axios";

const baseURL = "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL,
});

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axiosInstance.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
