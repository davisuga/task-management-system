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
