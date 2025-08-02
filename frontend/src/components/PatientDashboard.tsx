import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Upload, 
  Activity, 
  Calendar as CalendarIcon, 
  FileText, 
  User, 
  LogOut, 
  Bell,
  Heart,
  RefreshCw
} from 'lucide-react';
import { PatientUser } from '../App';
import { useNotificationManager } from '../hooks/useNotificationManager';
 import Ads from "../components/Ads";


interface PatientDashboardProps {
  user: PatientUser;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onRefreshAppointments?: () => Promise<PatientUser>;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  user, 
  onNavigate, 
  onLogout, 
  onRefreshAppointments 
}) => {
  const [currentUser, setCurrentUser] = useState<PatientUser>(user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use notification manager hook
  const { unreadCount } = useNotificationManager(currentUser);

  // Auto-refresh appointments every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (onRefreshAppointments) {
        try {
          setIsRefreshing(true);
          const updatedUser = await onRefreshAppointments();
          setCurrentUser(updatedUser);
          setLastUpdated(new Date());
        } catch (error) {
          console.error('Failed to refresh appointments:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [onRefreshAppointments]);

  // Update local state when user prop changes
  useEffect(() => {
    setCurrentUser(user);
    setLastUpdated(new Date());
  }, [user]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (onRefreshAppointments && !isRefreshing) {
      try {
        setIsRefreshing(true);
        const updatedUser = await onRefreshAppointments();
        setCurrentUser(updatedUser);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to refresh appointments:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Get upcoming appointments (future events only)
  // Get upcoming appointments (future events only)
const getUpcomingAppointments = () => {
  const now = new Date();
  
  return currentUser.appointments.filter(appointment => {
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  MedTrack Patient
                </h1>
                <p className="text-sm text-gray-600">
                  Personal Health Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate("notifications")}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Patient ID: {currentUser.id}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("profile")}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <User className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-full b ">
        {/* Left sidebar for Ads - vertical scrolling */}
        {/* Mobile: show Ads at top horizontally */}
        <div className="block md:hidden ">
          <Ads orientation="horizontal" />
        </div>

        {/* Desktop: sidebar vertical ads */}
        <div className="hidden md:block ">
          <aside className="w-64 h-full my-8  border-r border-gray-200 overflow-y-auto p-4 rounded-lg bg-white">
            <Ads orientation="vertical" />
          </aside>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Quick Actions
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => onNavigate("patient-chat")}
                      className="flex items-center space-x-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Chat with AI
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get medical advice and information
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => onNavigate("upload")}
                      className="flex items-center space-x-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-green-600 p-3 rounded-lg">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Upload Records
                        </h3>
                        <p className="text-sm text-gray-600">
                          Add medical documents and images
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => onNavigate("symptoms")}
                      className="flex items-center space-x-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Track Symptoms
                        </h3>
                        <p className="text-sm text-gray-600">
                          Monitor your health symptoms
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => onNavigate("calendar")}
                      className="flex items-center space-x-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-orange-600 p-3 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Calendar
                        </h3>
                        <p className="text-sm text-gray-600">
                          Manage appointments and reminders
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Records */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Medical Records
                    </h3>
                    <button
                      onClick={() => onNavigate("records")}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentUser.medicalRecords.slice(0, 3).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {record.category} • {record.uploadDate}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === "image"
                              ? "bg-green-100 text-green-800"
                              : record.type === "pdf"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.type.toUpperCase()}
                        </span>
                      </div>
                    ))}

                    {currentUser.medicalRecords.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No medical records yet</p>
                        <button
                          onClick={() => onNavigate("upload")}
                          className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Upload your first record
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Health Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Health Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Medical Records
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {currentUser.medicalRecords.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Active Symptoms
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        {currentUser.symptoms.filter((s) => !s.endDate).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Upcoming Events
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {getUpcomingAppointments().length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Symptoms */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Symptoms
                  </h3>
                  <div className="space-y-3">
                    {currentUser.symptoms.slice(0, 3).map((symptom) => (
                      <div
                        key={symptom.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {symptom.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {symptom.startDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < symptom.severity
                                  ? "bg-red-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {currentUser.symptoms.length === 0 && (
                      <p className="text-gray-600 text-sm">
                        No symptoms tracked
                      </p>
                    )}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Upcoming
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                      <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isRefreshing
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        title="Refresh appointments"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {getUpcomingAppointments()
                      .slice(0, 3)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 bg-blue-50 rounded-lg"
                        >
                          <p className="font-medium text-gray-900">
                            {appointment.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            at {appointment.time}
                          </p>
                        </div>
                      ))}

                    {getUpcomingAppointments().length === 0 && (
                      <p className="text-gray-600 text-sm">
                        No upcoming appointments
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;