import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PatientUser } from '../App';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isGenerated?: boolean;
}

interface UseNotificationManagerReturn {
  unreadCount: number;
  totalCount: number;
  notifications: Notification[];
  loading: boolean;
}

export const useNotificationManager = (user: PatientUser): UseNotificationManagerReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
            timestamp: new Date(now.getTime() - 5 * 60 * 1000),
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
            timestamp: new Date(now.getTime() - 2 * 60 * 1000),
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
            timestamp: new Date(now.getTime() - 1 * 60 * 1000),
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
          read: false, // Changed to false for consistency
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
          read: false, // Changed to always be false
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
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        read: false,
        priority: 'low',
        isGenerated: true
      });
    }

    return generatedNotifications;
  };

  useEffect(() => {
    const loadNotifications = () => {
      setLoading(true);
      try {
        // 1. Load notifications from Firebase
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.id));
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
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

        // Return cleanup function
        return unsubscribe;
        
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to generated notifications only
        const generatedNotifications = generateNotificationsFromAppointments();
        setNotifications(generatedNotifications);
        setLoading(false);
      }
    };

    const unsubscribe = loadNotifications();
    
    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user.appointments, user.medicalRecords, user.symptoms, user.id]);

  const unreadCount = notifications.length; // All notifications count as "unread"
  const totalCount = notifications.length;

  return {
    unreadCount,
    totalCount,
    notifications,
    loading
  };
};