import api from "./api";

export const getEmployees = async (params = {}) => {
  const { data } = await api.get("/employees", { params });
  return data; 
};

export const getEmployeeById = async (id) => {
  const { data } = await api.get(`/employees/${id}`);
  return data.data;
};

export const createEmployee = async (employeePayload) => {
  const { data } = await api.post("/employees", employeePayload);
  return data.data;
};

export const updateEmployee = async (id, employeePayload) => {
  const { data } = await api.put(`/employees/${id}`, employeePayload);
  return data.data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employees/${id}`);
  return data;
};
