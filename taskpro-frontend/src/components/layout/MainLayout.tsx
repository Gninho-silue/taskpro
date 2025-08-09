import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store.ts';
import { WebSocketService } from '../../services/WebSocketService';
import { fetchUnreadCount } from '../../store/slices/notificationsSlice.ts';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Connect to WebSocket when user is authenticated
    if (user) {
      WebSocketService.connect(user.id);
      
      // Fetch initial unread notifications count
      dispatch(fetchUnreadCount());
      
      // Cleanup on unmount
      return () => {
        WebSocketService.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          paddingTop: 10, // Space for fixed header
          paddingBottom: 8, // Space for footer
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout;