import api from "./api";

export const registerUser = async (name, email, password) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data.data;
};

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data;
};

export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data.data;
};
