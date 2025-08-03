import { db } from '../firebase/config';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface FirebaseNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  relatedEventId?: string;
  relatedEventType?: 'appointment' | 'medical_record' | 'symptom';
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async showNotification(options: NotificationOptions): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    if (this.permission === 'default') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      });

      // Auto-close notification after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Firebase notification management methods
  async createFirebaseNotification(data: FirebaseNotificationData): Promise<string | null> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...data,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });
      console.log('Notification created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create notification in Firebase:', error);
      return null;
    }
  }

  async createAppointmentNotification(userId: string, appointment: any): Promise<string | null> {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const isUpcoming = appointmentDateTime > now;
    
    return await this.createFirebaseNotification({
      userId,
      title: isUpcoming ? 'New Appointment Scheduled' : 'Appointment Added',
      message: `${appointment.title} on ${new Date(appointmentDateTime).toLocaleDateString()} at ${appointment.time}`,
      type: isUpcoming ? 'reminder' : 'info',
      priority: isUpcoming ? 'high' : 'medium',
      read: false,
      relatedEventId: appointment.id,
      relatedEventType: 'appointment'
    });
  }

  async createMedicalRecordNotification(userId: string, record: any): Promise<string | null> {
    return await this.createFirebaseNotification({
      userId,
      title: 'New Medical Record Added',
      message: `${record.title} has been uploaded to your medical records`,
      type: 'success',
      priority: 'medium',
      read: false,
      relatedEventId: record.id,
      relatedEventType: 'medical_record'
    });
  }

  async createSymptomNotification(userId: string, symptom: any): Promise<string | null> {
    const priorityLevel = symptom.severity >= 4 ? 'high' : symptom.severity >= 3 ? 'medium' : 'low';
    const severityText = ['Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'][symptom.severity - 1];
    
    return await this.createFirebaseNotification({
      userId,
      title: 'New Symptom Tracked',
      message: `${symptom.name} (${severityText}) has been added to your symptom tracker`,
      type: symptom.severity >= 4 ? 'warning' : 'info',
      priority: priorityLevel,
      read: false,
      relatedEventId: symptom.id,
      relatedEventType: 'symptom'
    });
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      console.log('Notification deleted from Firebase:', notificationId);
      return true;
    } catch (error) {
      console.error('Failed to delete notification from Firebase:', error);
      return false;
    }
  }

  async deleteAllUserNotifications(userId: string): Promise<boolean> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('All notifications deleted from Firebase for user:', userId);
      return true;
    } catch (error) {
      console.error('Failed to delete all notifications from Firebase:', error);
      return false;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    // This method deletes the notification instead of marking as read
    return await this.deleteNotification(notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    // This method deletes all notifications instead of marking as read
    return await this.deleteAllUserNotifications(userId);
  }
}