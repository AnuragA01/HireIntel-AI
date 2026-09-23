import API from "./api";

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (
  fullName,
  email,
  password,
  role
) => {
  const response = await API.post("/auth/register", {
    full_name: fullName,
    email,
    password,
    role,
  });

  return response.data;
};