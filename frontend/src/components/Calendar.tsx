import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, Bell, Pill, User, Edit3, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { PatientUser, Appointment } from '../App';
import { useAuth } from '../contexts/AuthContext';

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
  
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'appointment' as Appointment['type'],
    notes: ''
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...newAppointment
      };

      const updatedAppointments = [...user.appointments, appointment];
      await updateUserProfile({ appointments: updatedAppointments });

      // Reset form
      setNewAppointment({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
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

    try {
      const updatedAppointments = user.appointments.map(a => 
        a.id === editingAppointment.id ? editingAppointment : a
      );
      await updateUserProfile({ appointments: updatedAppointments });

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
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Event</span>
            </button>
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
                {user.appointments.slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
                
                {user.appointments.length === 0 && (
                  <p className="text-gray-600 text-sm">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appointments</span>
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
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
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
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
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
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
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
                    value={editingAppointment.time}
                    onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
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