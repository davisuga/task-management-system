# Create directories for components, hooks, and services
mkdir -p components hooks services

# Create component files
cat <<EOL >components/App.tsx
import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import UserManagement from "./UserManagement";
import TaskManagement from "./TaskManagement";

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Task Management System
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <UserManagement />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskManagement />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
EOL

cat <<EOL >components/UserManagement.tsx
import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { Button, CircularProgress, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { PersonAdd as PersonAddIcon, Delete as DeleteIcon } from "@mui/icons-material";

const UserManagement: React.FC = () => {
  const [newUser, setNewUser] = useState("");
  const { users, isLoadingUsers, addUser, removeUser, isAddingUser, isRemovingUser } = useUsers();

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Users
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
        placeholder="New user name"
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={() => addUser(newUser)}
        fullWidth
        disabled={isAddingUser}
      >
        {isAddingUser ? <CircularProgress size={24} /> : "Add User"}
      </Button>
      {isLoadingUsers ? (
        <CircularProgress sx={{ display: "block", m: "auto", mt: 2 }} />
      ) : (
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemText primary={user.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => removeUser(user.id)}
                  disabled={isRemovingUser}
                >
                  {isRemovingUser ? <CircularProgress size={24} /> : <DeleteIcon />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default UserManagement;
EOL

cat <<EOL >components/TaskManagement.tsx
import React, { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { Button, CircularProgress, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const TaskManagement: React.FC = () => {
  const [newTask, setNewTask] = useState("");
  const { tasks, isLoadingTasks, addTask, assignTask, unassignTask, isAddingTask, isAssigningTask, isUnassigningTask } = useTasks();
  const { users } = useUsers();

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Tasks
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task title"
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => addTask(newTask)}
        fullWidth
        disabled={isAddingTask}
      >
        {isAddingTask ? <CircularProgress size={24} /> : "Add Task"}
      </Button>
      {isLoadingTasks ? (
        <CircularProgress sx={{ display: "block", m: "auto", mt: 2 }} />
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id}>
              <ListItemText
                primary={task.title}
                secondary={
                  task.assigned_to
                    ? \`Assigned to: \${users.find((u) => u.id === task.assigned_to)?.name}\`
                    : "Unassigned"
                }
              />
              <ListItemSecondaryAction>
                {task.assigned_to ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => unassignTask(task.id)}
                    disabled={isUnassigningTask}
                  >
                    {isUnassigningTask ? <CircularProgress size={24} /> : "Unassign"}
                  </Button>
                ) : (
                  <Select
                    value=""
                    onChange={(e) =>
                      assignTask({
                        taskId: task.id,
                        userId: Number(e.target.value),
                      })
                    }
                    displayEmpty
                    size="small"
                    disabled={isAssigningTask}
                  >
                    <MenuItem value="" disabled>
                      Assign to
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TaskManagement;
EOL

# Create hook files
cat <<EOL >hooks/useUsers.ts
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
    mutationFn: (userId: number) => api.delete(\`/users/\${userId}\`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users,
    isLoadingUsers,
    addUser: addUserMutation.mutate,
    removeUser: removeUserMutation.mutate,
    isAddingUser: addUserMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
  };
};
EOL

cat <<EOL >hooks/useTasks.ts
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
      api.put(\`/tasks/\${taskId}/assign/\${userId}\`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const unassignTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.put(\`/tasks/\${taskId}/unassign\`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    tasks,
    isLoadingTasks,
    addTask: addTaskMutation.mutate,
    assignTask: assignTaskMutation.mutate,
    unassignTask: unassignTaskMutation.mutate,
    isAddingTask: addTaskMutation.isPending,
    isAssigningTask: assignTaskMutation.isPending,
    isUnassigningTask: unassignTaskMutation.isPending,
  };
};
EOL

# Create service files
cat <<EOL >services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});
EOL

# Create the main entry file
cat <<EOL >index.tsx
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./components/App";

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById("root")
);
EOL

echo "Project structure created successfully."
