import React, { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import {
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Delete } from "@mui/icons-material";

export const TaskManagement: React.FC = () => {
  const [newTask, setNewTask] = useState("");
  const {
    tasks,
    isLoadingTasks,
    addTask,
    assignTask,
    unassignTask,
    isAddingTask,
    isAssigningTask,
    isUnassigningTask,
    deleteTask,
    isDeletingTask,
  } = useTasks();
  const { users } = useUsers();
  const [snackBarState, setSnackBarState] = useState({
    open: false,
    message: "",
  });

  const handleClose = () => {
    setSnackBarState({ message: "", open: false });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask("");
    }
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId).catch((res) =>
      setSnackBarState({
        open: true,
        message: res.response.data.detail,
      })
    );
  };

  const handleAssignTask = (taskId: number, userId: number) => {
    assignTask({ taskId, userId });
  };

  const handleUnassignTask = (taskId: number) => {
    unassignTask(taskId);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }} data-testid="task-management">
      <Typography variant="h5" component="h2" gutterBottom>
        Tasks
      </Typography>
      <Snackbar
        open={snackBarState.open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackBarState.message}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task title"
        sx={{ mb: 2 }}

        inputProps={{ 'data-testid': 'new-task-input' }}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddTask}
        fullWidth
        disabled={isAddingTask}
        data-testid="add-task-button"
      >
        {isAddingTask ? <CircularProgress size={24} /> : "Add Task"}
      </Button>
      {isLoadingTasks ? (
        <CircularProgress sx={{ display: "block", m: "auto", mt: 2 }} />
      ) : (
        <TaskList
          tasks={tasks}
          users={users}
          onDeleteTask={handleDeleteTask}
          onAssignTask={handleAssignTask}
          onUnassignTask={handleUnassignTask}
          isDeletingTask={isDeletingTask}
          isAssigningTask={isAssigningTask}
          isUnassigningTask={isUnassigningTask}
        />
      )}
    </Paper>
  );
};

interface TaskListProps {
  tasks: Array<{ id: number; title: string; assigned_to: number | null }>;
  users: Array<{ id: number; name: string }>;
  onDeleteTask: (taskId: number) => void;
  onAssignTask: (taskId: number, userId: number) => void;
  onUnassignTask: (taskId: number) => void;
  isDeletingTask: boolean;
  isAssigningTask: boolean;
  isUnassigningTask: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  users,
  onDeleteTask,
  onAssignTask,
  onUnassignTask,
  isDeletingTask,
  isAssigningTask,
  isUnassigningTask,
}) => (
  <List data-testid="task-list">
    {tasks.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        users={users}
        onDeleteTask={onDeleteTask}
        onAssignTask={onAssignTask}
        onUnassignTask={onUnassignTask}
        isDeletingTask={isDeletingTask}
        isAssigningTask={isAssigningTask}
        isUnassigningTask={isUnassigningTask}
      />
    ))}
  </List>
);

interface TaskItemProps {
  task: { id: number; title: string; assigned_to: number | null };
  users: Array<{ id: number; name: string }>;
  onDeleteTask: (taskId: number) => void;
  onAssignTask: (taskId: number, userId: number) => void;
  onUnassignTask: (taskId: number) => void;
  isDeletingTask: boolean;
  isAssigningTask: boolean;
  isUnassigningTask: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  users,
  onDeleteTask,
  onAssignTask,
  onUnassignTask,
  isDeletingTask,
  isAssigningTask,
  isUnassigningTask,
}) => (
  <ListItem data-testid={`task-item-${task.id}`}>
    <ListItemIcon>
      <IconButton
        onClick={() => onDeleteTask(task.id)}
        disabled={isDeletingTask}
        data-testid={`delete-task-${task.id}`}
      >
        {isDeletingTask ? <CircularProgress size={24} /> : <Delete />}
      </IconButton>
    </ListItemIcon>
    <ListItemText
      primary={task.title}
      secondary={
        task.assigned_to
          ? `Assigned to: ${users.find((u) => u.id === task.assigned_to)?.name}`
          : "Unassigned"
      }
    />
    <ListItemSecondaryAction>
      {task.assigned_to ? (
        <Button
          variant="outlined"
          size="small"
          onClick={() => onUnassignTask(task.id)}
          disabled={isUnassigningTask}
          data-testid={`unassign-task-${task.id}`}
        >
          {isUnassigningTask ? <CircularProgress size={24} /> : "Unassign"}
        </Button>
      ) : (
        <Select
          value=""
          onChange={(e) => onAssignTask(task.id, Number(e.target.value))}
          displayEmpty
          size="small"
          disabled={isAssigningTask}
          data-testid={`assign-task-${task.id}`}
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
);

export default TaskManagement;