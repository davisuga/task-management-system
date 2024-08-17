import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});
interface User {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  assigned_to: number | null;
}
export const listTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};
export const listUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};
export const createUser = async (name: string): Promise<User> => {
  const response = await api.post<User>("/users", { name });
  return response.data;
};

export const createTask = async (title: string): Promise<Task> => {
  const response = await api.post<Task>("/tasks", { title });
  return response.data;
};

export const assignTask = async (
  taskId: number,
  userId: number
): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}/assign/${userId}`);
  return response.data;
};

export const unassignTask = async (taskId: number): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}/unassign`);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
