import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {  createUser, deleteUser, listUsers } from "../services/api";

interface User {
  id: number;
  name: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => listUsers(),
  });

  const addUserMutation = useMutation({
    mutationFn: (name: string) => createUser(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
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
