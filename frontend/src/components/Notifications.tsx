import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Clock, X, Filter, Search } from 'lucide-react';
import { PatientUser } from '../App';
import { NotificationService } from '../services/notificationService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isGenerated?: boolean; // Flag to identify generated vs Firebase notifications
}

interface NotificationsProps {
  onBack: () => void;
  user: PatientUser;
}

const Notifications: React.FC<NotificationsProps> = ({ onBack, user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const notificationService = NotificationService.getInstance();

  // Helper function to generate notifications from user data
  const generateNotificationsFromAppointments = (): Notification[] => {
    const now = new Date();
    const generatedNotifications: Notification[] = [];

    user.appointments.forEach(appointment => {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const timeDifference = appointmentDateTime.getTime() - now.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      // Upcoming appointment notifications
      if (timeDifference > 0) {
        if (daysDifference === 1) {
          // Tomorrow notification
          generatedNotifications.push({
            id: `${appointment.id}-tomorrow`,
            title: 'Appointment Tomorrow',
            message: `${appointment.title} is scheduled for tomorrow at ${appointment.time}`,
            type: 'reminder',
            timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
            read: false,
            priority: 'high',
            isGenerated: true
          });
        } else if (hoursDifference <= 2 && hoursDifference > 0) {
          // Within 2 hours notification
          generatedNotifications.push({
            id: `${appointment.id}-soon`,
            title: 'Appointment Soon',
            message: `${appointment.title} is in ${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} at ${appointment.time}`,
            type: 'warning',
            timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
            read: false,
            priority: 'high',
            isGenerated: true
          });
        } else if (minutesDifference <= 15 && minutesDifference > 0) {
          // 15 minutes or less notification
          generatedNotifications.push({
            id: `${appointment.id}-imminent`,
            title: 'Appointment Starting Soon',
            message: `${appointment.title} starts in ${minutesDifference} minutes`,
            type: 'warning',
            timestamp: new Date(now.getTime() - 1 * 60 * 1000), // 1 minute ago
            read: false,
            priority: 'high',
            isGenerated: true
          });
        }
      }

      // Past appointment notifications
      if (timeDifference < 0 && Math.abs(daysDifference) <= 7) {
        generatedNotifications.push({
          id: `${appointment.id}-completed`,
          title: 'Appointment Completed',
          message: `${appointment.title} was scheduled for ${new Date(appointmentDateTime).toLocaleDateString()} at ${appointment.time}`,
          type: 'success',
          timestamp: appointmentDateTime,
          read: true,
          priority: 'medium',
          isGenerated: true
        });
      }
    });

    // Medical records notifications
    user.medicalRecords.forEach((record) => {
      const uploadDate = new Date(record.uploadDate);
      const daysSinceUpload = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpload <= 3) {
        generatedNotifications.push({
          id: `record-${record.id}`,
          title: 'New Medical Record',
          message: `${record.title} has been uploaded to your records`,
          type: 'success',
          timestamp: uploadDate,
          read: daysSinceUpload > 1,
          priority: 'medium',
          isGenerated: true
        });
      }
    });

    // Symptom tracking notifications
    user.symptoms.forEach(symptom => {
      const startDate = new Date(symptom.startDate);
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (!symptom.endDate && daysSinceStart >= 3 && daysSinceStart <= 7) {
        generatedNotifications.push({
          id: `symptom-${symptom.id}`,
          title: 'Ongoing Symptom',
          message: `You've been tracking "${symptom.name}" for ${daysSinceStart} days. Consider consulting your doctor if symptoms persist.`,
          type: 'warning',
          timestamp: new Date(now.getTime() - daysSinceStart * 24 * 60 * 60 * 1000),
          read: false,
          priority: symptom.severity >= 4 ? 'high' : 'medium',
          isGenerated: true
        });
      }
    });

    // General health reminders
    if (user.appointments.length === 0) {
      generatedNotifications.push({
        id: 'no-appointments',
        title: 'Schedule Regular Check-up',
        message: 'It\'s important to schedule regular health check-ups. Consider booking an appointment with your healthcare provider.',
        type: 'info',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        priority: 'low',
        isGenerated: true
      });
    }

    return generatedNotifications;
  };

  // Load notifications from Firebase and merge with generated ones
  useEffect(() => {
    setLoading(true);
    let unsubscribe: (() => void) | undefined;

    try {
      // 1. Load notifications from Firebase
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', user.id));
      
      // Set up real-time listener
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseNotifications: Notification[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            message: data.message,
            type: data.type,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            read: false, // Always treat as unread since we only use delete
            priority: data.priority || 'medium',
            actionUrl: data.actionUrl,
            isGenerated: false
          };
        });

        // 2. Generate notifications from user data
        const generatedNotifications = generateNotificationsFromAppointments();
        
        // 3. Get dismissed notifications from localStorage
        const dismissed = JSON.parse(localStorage.getItem(`dismissedNotifications_${user.id}`) || '[]');
        
        // 4. Filter out dismissed generated notifications
        const filteredGenerated = generatedNotifications.filter(notif => 
          !dismissed.includes(notif.id)
        );
        
        // 5. Merge and sort all notifications
        const allNotifications = [...firebaseNotifications, ...filteredGenerated]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setNotifications(allNotifications);
        setLoading(false);
      });
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to generated notifications only
      const generatedNotifications = generateNotificationsFromAppointments();
      setNotifications(generatedNotifications);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user.appointments, user.medicalRecords, user.symptoms, user.id]);

  // Delete function that handles both Firebase and generated notifications
  const deleteNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification?.isGenerated) {
        // It's a generated notification - add to dismissed list and remove from state
        const dismissed = JSON.parse(localStorage.getItem(`dismissedNotifications_${user.id}`) || '[]');
        dismissed.push(notificationId);
        localStorage.setItem(`dismissedNotifications_${user.id}`, JSON.stringify(dismissed));
        
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      } else {
        // It's a Firebase notification - try to delete from Firebase
        const success = await notificationService.deleteNotification(notificationId);
        
        if (success) {
          // Firebase deletion successful, state will update via onSnapshot
          console.log('Notification deleted from Firebase:', notificationId);
        } else {
          console.error('Failed to delete notification from Firebase');
          // Optionally show error message to user
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback: remove from local state anyway
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'reminder':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const filteredNotifications = notifications
    .filter(notif => 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = notifications.length; // All notifications count as unread

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">Stay updated with your health information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter by Type */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Notifications</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${getPriorityColor(notification.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {notification.priority === 'high' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                      {notification.isGenerated && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Auto-generated
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'No notifications match your search'
                  : 'You\'re all caught up! No new notifications.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Notification Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'reminder').length}
              </div>
              <div className="text-sm text-gray-600">Reminders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;