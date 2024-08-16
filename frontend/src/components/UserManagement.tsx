import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import {
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

export const UserManagement: React.FC = () => {
  const [newUser, setNewUser] = useState("");
  const {
    users,
    isLoadingUsers,
    addUser,
    removeUser,
    isAddingUser,
    isRemovingUser,
  } = useUsers();
  const [snackBarState, setSnackBarState] = useState({
    open: false,
    message: "",
  });

  const handleClose = () => {
    setSnackBarState({ message: "", open: false });
  };

  const handleAddUser = async () => {
    if (newUser.trim()) {
      await addUser(newUser);
      setNewUser("");
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await removeUser(userId);

    } catch (res) {

      setSnackBarState({
        open: true,
        message: res.response.data.detail,
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }} data-testid="user-management">
      <Snackbar
        open={snackBarState.open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackBarState.message}
      />
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
        inputProps={{ 'data-testid': 'new-user-input' }}
      />
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleAddUser}
        fullWidth
        disabled={isAddingUser}

        data-testid="add-user-button"
      >
        {isAddingUser ? <CircularProgress size={24} /> : "Add User"}
      </Button>
      {isLoadingUsers ? (
        <CircularProgress sx={{ display: "block", m: "auto", mt: 2 }} />
      ) : (
        <UserList
          users={users}
          onRemoveUser={handleRemoveUser}
          isRemovingUser={isRemovingUser}
        />
      )}
    </Paper>
  );
};

interface UserListProps {
  users: Array<{ id: number; name: string }>;
  onRemoveUser: (userId: number) => void;
  isRemovingUser: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, onRemoveUser, isRemovingUser }) => (
  <List data-testid="user-list">
    {users.map((user) => (
      <UserItem
        key={user.id}
        user={user}
        onRemoveUser={onRemoveUser}
        isRemovingUser={isRemovingUser}
      />
    ))}
  </List>
);

interface UserItemProps {
  user: { id: number; name: string };
  onRemoveUser: (userId: number) => void;
  isRemovingUser: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, onRemoveUser, isRemovingUser }) => (
  <ListItem data-testid={`user-item-${user.id}`}>
    <ListItemText primary={user.name} />
    <ListItemSecondaryAction>
      <IconButton
        edge="end"
        onClick={() => onRemoveUser(user.id)}
        disabled={isRemovingUser}
        data-testid={`remove-user-${user.id}`}
      >
        {isRemovingUser ? <CircularProgress size={24} /> : <DeleteIcon />}
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
);

export default UserManagement;