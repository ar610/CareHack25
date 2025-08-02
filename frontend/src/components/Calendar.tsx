import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, Bell, Pill, User, Edit3, Trash2, AlertCircle, CheckCircle, BellRing } from 'lucide-react';
import { PatientUser, Appointment } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '../services/notificationService';

interface CalendarProps {
  user: PatientUser;
  onBack: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ user, onBack }) => {
  const { updateUserProfile } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const notificationService = NotificationService.getInstance();
  
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: 'appointment' as Appointment['type'],
    notes: ''
  });

  // Initialize notifications and check for upcoming appointments
  useEffect(() => {
    const initializeNotifications = async () => {
      const permission = notificationService.getPermission();
      setNotificationPermission(permission);
      setNotificationsEnabled(permission === 'granted');
    };

    initializeNotifications();
    checkUpcomingAppointments();

    // Check for upcoming appointments every minute
    const interval = setInterval(checkUpcomingAppointments, 60000);
    return () => clearInterval(interval);
  }, [user.appointments]);

  const checkUpcomingAppointments = () => {
    const now = new Date();
    const upcomingAppointments = getUpcomingEvents();

    upcomingAppointments.forEach(appointment => {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const timeDifference = appointmentDateTime.getTime() - now.getTime();
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      // Notify 15 minutes before appointment
      if (minutesDifference === 15) {
        showAppointmentNotification(appointment, '15 minutes');
      }
      // Notify 5 minutes before appointment
      else if (minutesDifference === 5) {
        showAppointmentNotification(appointment, '5 minutes');
      }
      // Notify when appointment time arrives
      else if (minutesDifference === 0) {
        showAppointmentNotification(appointment, 'now');
      }
    });
  };

  const showAppointmentNotification = async (appointment: Appointment, timeUntil: string) => {
    if (!notificationsEnabled) return;

    const typeEmoji = appointment.type === 'appointment' ? '👩‍⚕️' : 
                     appointment.type === 'medication' ? '💊' : '📋';
    
    const title = timeUntil === 'now' 
      ? `${typeEmoji} Appointment Time!`
      : `${typeEmoji} Upcoming Appointment`;
    
    const body = timeUntil === 'now'
      ? `${appointment.title} is starting now`
      : `${appointment.title} in ${timeUntil}`;

    await notificationService.showNotification({
      title,
      body,
      tag: `appointment-${appointment.id}`,
      requireInteraction: timeUntil === 'now'
    });
  };

  const requestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    setNotificationsEnabled(permission === 'granted');
    
    if (permission === 'granted') {
      setSuccess('Notifications enabled! You\'ll receive reminders for upcoming appointments.');
    } else {
      setError('Notification permission denied. You won\'t receive appointment reminders.');
    }
  };

  const toggleNotifications = () => {
    if (notificationPermission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
      if (!notificationsEnabled) {
        setSuccess('Notifications enabled!');
      } else {
        setSuccess('Notifications disabled.');
      }
    } else {
      requestNotificationPermission();
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate that the appointment is not in the past
    const appointmentDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      setError('Cannot schedule appointments in the past. Please select a future time.');
      setIsLoading(false);
      return;
    }

    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...newAppointment
      };

      const updatedAppointments = [...user.appointments, appointment];
      await updateUserProfile({ appointments: updatedAppointments });

      // Create Firebase notification for the new appointment
      try {
        await notificationService.createAppointmentNotification(user.id, appointment);
      } catch (notifError) {
        console.error('Failed to create appointment notification:', notifError);
        // Don't fail the appointment creation if notification fails
      }

      // Reset form with current date and time
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      setNewAppointment({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: currentTime,
        type: 'appointment',
        notes: ''
      });
      setShowAddForm(false);
      setSuccess('Event added successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Only validate future time if the appointment is being moved to a future date
    const appointmentDateTime = new Date(`${editingAppointment.date}T${editingAppointment.time}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      setError('Cannot schedule appointments in the past. Please select a future time.');
      setIsLoading(false);
      return;
    }

    try {
      const updatedAppointments = user.appointments.map(a => 
        a.id === editingAppointment.id ? editingAppointment : a
      );
      await updateUserProfile({ appointments: updatedAppointments });

      // Create Firebase notification for the updated appointment
      try {
        await notificationService.createFirebaseNotification({
          userId: user.id,
          title: 'Appointment Updated',
          message: `${editingAppointment.title} has been rescheduled to ${new Date(`${editingAppointment.date}T${editingAppointment.time}`).toLocaleDateString()} at ${editingAppointment.time}`,
          type: 'info',
          priority: 'medium',
          read: false,
          relatedEventId: editingAppointment.id,
          relatedEventType: 'appointment'
        });
      } catch (notifError) {
        console.error('Failed to create appointment update notification:', notifError);
      }

      setEditingAppointment(null);
      setSuccess('Event updated successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedAppointments = user.appointments.filter(a => a.id !== appointmentId);
      await updateUserProfile({ appointments: updatedAppointments });
      setSuccess('Event deleted successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'appointment': return <User className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'medication': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate calendar days for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAppointmentsForDate = (date: string) => {
    return user.appointments.filter(apt => apt.date === date);
  };

  // Get past events
  const getPastEvents = () => {
    const now = new Date();
    
    return user.appointments.filter(appointment => {
      // Create a proper datetime object for the appointment
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      
      // Only include appointments that are in the past
      return appointmentDateTime <= now;
    }).sort((a, b) => {
      // Sort by date and time, most recent first
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  };

  // Get upcoming events (future events only)
  const getUpcomingEvents = () => {
    const now = new Date();
    
    return user.appointments.filter(appointment => {
      // Create a proper datetime object for the appointment
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      
      // Only include appointments that are in the future
      return appointmentDateTime > now;
    }).sort((a, b) => {
      // Sort by date and time, earliest first
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  };

  // Helper functions for date/time validation
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const getMinTime = (selectedDate: string) => {
    const today = getCurrentDate();
    if (selectedDate === today) {
      return getCurrentTime();
    }
    return '00:00';
  };

  // Handle date change and update time if necessary
  const handleDateChange = (newDate: string) => {
    const updatedAppointment = { ...newAppointment, date: newDate };
    
    // If selecting today and current time is in the past, update to current time
    if (newDate === getCurrentDate()) {
      const currentTime = getCurrentTime();
      if (newAppointment.time < currentTime) {
        updatedAppointment.time = currentTime;
      }
    }
    
    setNewAppointment(updatedAppointment);
  };

  const handleEditDateChange = (newDate: string) => {
    if (!editingAppointment) return;
    
    const updatedAppointment = { ...editingAppointment, date: newDate };
    
    // If selecting today and current time is in the past, update to current time
    if (newDate === getCurrentDate()) {
      const currentTime = getCurrentTime();
      if (editingAppointment.time < currentTime) {
        updatedAppointment.time = currentTime;
      }
    }
    
    setEditingAppointment(updatedAppointment);
  };

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
                <h1 className="text-xl font-bold text-gray-900">Health Calendar</h1>
                <p className="text-sm text-gray-600">Manage appointments and medication reminders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleNotifications}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  notificationsEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
              >
                {notificationsEnabled ? (
                  <BellRing className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
                <span className="text-sm">
                  {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
                </span>
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-24"></div>;
                  }
                  
                  const dateString = formatDate(day);
                  const appointments = getAppointmentsForDate(dateString);
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  
                  return (
                    <div
                      key={day}
                      className={`p-2 h-24 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        isToday ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {appointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getTypeColor(apt.type)}`}
                          >
                            {apt.title}
                          </div>
                        ))}
                        {appointments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{appointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {notificationsEnabled ? (
                      <BellRing className="h-5 w-5 text-green-600" />
                    ) : (
                      <Bell className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      Browser Notifications
                    </span>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {notificationsEnabled && (
                  <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                    📱 You'll receive notifications 15 min, 5 min, and at appointment time
                  </div>
                )}
                
                {!notificationsEnabled && notificationPermission === 'denied' && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Notifications blocked. Please enable in browser settings.
                  </div>
                )}
                
                {!notificationsEnabled && notificationPermission === 'default' && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 Click the toggle above to enable appointment reminders
                  </div>
                )}
              </div>
            </div>
            {/* Selected Date Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map(appointment => (
                  <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getTypeColor(appointment.type)}`}>
                          {getTypeIcon(appointment.type)}
                        </div>
                        <span className="font-medium text-gray-900">{appointment.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingAppointment(appointment)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          disabled={isLoading}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                ))}
                
                {getAppointmentsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-600 text-sm">No events for this date</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              
              <div className="space-y-3">
                {getUpcomingEvents().slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
                
                {getUpcomingEvents().length === 0 && (
                  <p className="text-gray-600 text-sm">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Past Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Events</h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {getPastEvents().slice(0, 10).map(appointment => (
                  <div key={appointment.id} className="flex items-center space-x-3 opacity-75">
                    <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{appointment.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: appointment.date.substring(0, 4) !== new Date().getFullYear().toString() ? 'numeric' : undefined
                        })} at {appointment.time}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {getPastEvents().length === 0 && (
                  <p className="text-gray-600 text-sm">No past events</p>
                )}
                
                {getPastEvents().length > 10 && (
                  <p className="text-xs text-gray-500 text-center pt-2 border-t">
                    Showing 10 most recent events
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming Events</span>
                  <span className="text-lg font-bold text-blue-600">
                    {getUpcomingEvents().length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Past Events</span>
                  <span className="text-lg font-bold text-gray-600">
                    {getPastEvents().length}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medical Appointments</span>
                  <span className="text-lg font-bold text-blue-600">
                    {user.appointments.filter(a => a.type === 'appointment').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medication Reminders</span>
                  <span className="text-lg font-bold text-green-600">
                    {user.appointments.filter(a => a.type === 'medication').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Other Reminders</span>
                  <span className="text-lg font-bold text-orange-600">
                    {user.appointments.filter(a => a.type === 'reminder').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Event</h2>
            
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Doctor Appointment, Take Medicine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value as Appointment['type']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="appointment">Medical Appointment</option>
                  <option value="medication">Medication Reminder</option>
                  <option value="reminder">General Reminder</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    min={getCurrentDate()}
                    value={newAppointment.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    min={getMinTime(newAppointment.date)}
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {newAppointment.date === getCurrentDate() && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select a time after {getCurrentTime()}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Additional details or reminders..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Event</h2>
            
            <form onSubmit={handleEditAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editingAppointment.title}
                  onChange={(e) => setEditingAppointment({...editingAppointment, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Doctor Appointment, Take Medicine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={editingAppointment.type}
                  onChange={(e) => setEditingAppointment({...editingAppointment, type: e.target.value as Appointment['type']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="appointment">Medical Appointment</option>
                  <option value="medication">Medication Reminder</option>
                  <option value="reminder">General Reminder</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    min={getCurrentDate()}
                    value={editingAppointment.date}
                    onChange={(e) => handleEditDateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    min={getMinTime(editingAppointment.date)}
                    value={editingAppointment.time}
                    onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {editingAppointment.date === getCurrentDate() && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select a time after {getCurrentTime()}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editingAppointment.notes}
                  onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Additional details or reminders..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;