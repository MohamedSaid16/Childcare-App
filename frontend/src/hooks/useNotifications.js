import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

// Notification utilities and helpers
export const useNotificationUtils = () => {
  const { addNotification, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Create different types of notifications
  const notifySuccess = (title, message, options = {}) => {
    addNotification({
      title,
      message,
      type: 'success',
      priority: 'medium',
      ...options
    });
  };

  const notifyError = (title, message, options = {}) => {
    addNotification({
      title,
      message,
      type: 'error',
      priority: 'high',
      ...options
    });
  };

  const notifyWarning = (title, message, options = {}) => {
    addNotification({
      title,
      message,
      type: 'warning',
      priority: 'medium',
      ...options
    });
  };

  const notifyInfo = (title, message, options = {}) => {
    addNotification({
      title,
      message,
      type: 'info',
      priority: 'low',
      ...options
    });
  };

  // Domain-specific notification helpers
  const notifyAttendance = (childName, action, options = {}) => {
    addNotification({
      title: 'Attendance Update',
      message: `${childName} has been ${action}`,
      type: 'attendance',
      priority: 'medium',
      ...options
    });
  };

  const notifyActivity = (childName, activityName, options = {}) => {
    addNotification({
      title: 'New Activity',
      message: `${childName} participated in ${activityName}`,
      type: 'activity',
      priority: 'low',
      ...options
    });
  };

  const notifyPayment = (amount, status, options = {}) => {
    addNotification({
      title: 'Payment Update',
      message: `Payment of $${amount} is ${status}`,
      type: 'payment',
      priority: status === 'failed' ? 'high' : 'medium',
      ...options
    });
  };

  const notifyMedicalAlert = (childName, condition, options = {}) => {
    addNotification({
      title: 'Medical Alert',
      message: `${childName}: ${condition}`,
      type: 'medical',
      priority: 'high',
      ...options
    });
  };

  // Batch notification operations
  const markMultipleAsRead = (notificationIds) => {
    notificationIds.forEach(id => markAsRead(id));
  };

  const deleteMultipleNotifications = (notificationIds) => {
    notificationIds.forEach(id => deleteNotification(id));
  };

  // Notification filters
  const filterNotifications = (notifications, filters = {}) => {
    let filtered = [...notifications];

    if (filters.type) {
      filtered = filtered.filter(notification => notification.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(notification => notification.priority === filters.priority);
    }

    if (filters.unreadOnly) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.message.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.createdAt);
        return notificationDate >= filters.dateRange.start &&
               notificationDate <= filters.dateRange.end;
      });
    }

    return filtered;
  };

  // Notification statistics
  const getNotificationStats = (notifications) => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority
    };
  };

  // Auto-dismiss notifications
  const createAutoDismissNotification = (notification, duration = 5000) => {
    const notificationId = addNotification(notification);
    
    setTimeout(() => {
      deleteNotification(notificationId);
    }, duration);

    return notificationId;
  };

  // Notification preferences (could be stored in localStorage or backend)
  const getNotificationPreferences = () => {
    const defaults = {
      sound: true,
      desktop: true,
      email: false,
      push: true,
      types: {
        attendance: true,
        activity: true,
        payment: true,
        medical: true,
        system: true
      },
      priorities: {
        low: true,
        medium: true,
        high: true
      }
    };

    try {
      const stored = localStorage.getItem('notificationPreferences');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  };

  const saveNotificationPreferences = (preferences) => {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  return {
    // Basic notification methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Domain-specific methods
    notifyAttendance,
    notifyActivity,
    notifyPayment,
    notifyMedicalAlert,
    
    // Batch operations
    markMultipleAsRead,
    deleteMultipleNotifications,
    
    // Utilities
    filterNotifications,
    getNotificationStats,
    createAutoDismissNotification,
    
    // Preferences
    getNotificationPreferences,
    saveNotificationPreferences
  };
};

// Hook for real-time notifications (WebSocket/SSE)
export const useRealtimeNotifications = (url) => {
  const { addNotification } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
      } catch (error) {
        console.error('Failed to parse real-time notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time notification error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [url, addNotification]);

  return { isConnected };
};

export default useNotifications;