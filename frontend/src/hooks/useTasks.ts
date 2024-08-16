import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

interface Task {
  id: number;
  title: string;
  assigned_to: number | null;
}

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => api.get("/tasks").then((res) => res.data),
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) => api.post("/tasks", { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: number; userId: number }) =>
      api.put(`/tasks/${taskId}/assign/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const unassignTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.put(`/tasks/${taskId}/unassign`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    tasks,
    isLoadingTasks,
    addTask: addTaskMutation.mutateAsync,
    assignTask: assignTaskMutation.mutateAsync,
    unassignTask: unassignTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeletingTask: deleteTaskMutation.isPending,
    isAddingTask: addTaskMutation.isPending,
    isAssigningTask: assignTaskMutation.isPending,
    isUnassigningTask: unassignTaskMutation.isPending,
  };
};
