import { useState, useEffect } from 'react';
import { Notification } from '../components/ui/NotificationsDropdown';

// Safe localStorage access for SSR
const getLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize notifications from localStorage on client side only
  useEffect(() => {
    const saved = getLocalStorage('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setLocalStorage('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount
  };
};