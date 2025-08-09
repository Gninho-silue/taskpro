import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store.ts';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearAllNotifications 
} from '../../store/slices/notificationsSlice.ts';
import { 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  CheckCircle, 
  Error, 
  Info, 
  Assignment 
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Notification, NotificationType } from '../../types';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ 
  anchorEl, 
  open, 
  onClose 
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications());
    }
  }, [open, dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return <Assignment color="primary" />;
      case NotificationType.TASK_COMPLETED:
        return <CheckCircle color="success" />;
      case NotificationType.TASK_COMMENT:
        return <Info color="info" />;
      case NotificationType.PROJECT_INVITATION:
      case NotificationType.TEAM_INVITATION:
        return <NotificationsIcon color="secondary" />;
      case NotificationType.SYSTEM:
      default:
        return <Info color="action" />;
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          width: 360,
          maxHeight: 500,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{t('notifications.title')}</Typography>
        <Box>
          <Button size="small" onClick={handleMarkAllAsRead}>
            {t('notifications.markAllAsRead')}
          </Button>
          <Button size="small" color="error" onClick={handleClearAll}>
            {t('notifications.clearAll')}
          </Button>
        </Box>
      </Box>
      <Divider />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('notifications.noNotifications')}
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
          {notifications.map((notification: Notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                button
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemAvatar>
                  <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                      </Typography>
                      {notification.relatedProject && (
                        <Typography component="span" variant="body2">
                          {' — '}{notification.relatedProject.name}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Menu>
  );
};

export default NotificationsMenu;