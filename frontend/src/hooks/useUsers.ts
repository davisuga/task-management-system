import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

interface User {
  id: number;
  name: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((res) => res.data),
  });

  const addUserMutation = useMutation({
    mutationFn: (name: string) => api.post("/users", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/users/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users,
    isLoadingUsers,
    addUser: addUserMutation.mutateAsync,
    removeUser: removeUserMutation.mutateAsync,
    isAddingUser: addUserMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
  };
};