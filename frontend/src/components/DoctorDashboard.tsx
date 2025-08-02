import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Clock, User, LogOut, Key, AlertCircle, Bell } from 'lucide-react';
import { Doctor, Patient } from '../App';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

interface DoctorDashboardProps {
  user: Doctor;
  onPatientSelect: (patient: Patient) => void;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onPatientSelect, onLogout, onNavigate }) => {
  const [patientId, setPatientId] = useState('');
  const [patientKey, setPatientKey] = useState('');
  const [searchError, setSearchError] = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Load doctor's notifications from Firebase
  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', user.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreadCount = snapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.read;
      }).length;
      
      setUnreadNotificationCount(unreadCount);
    });

    return unsubscribe;
  }, [user.id]);

  // Mock patient data
  const recentPatients: Patient[] = [
    {
      id: 'P001',
      name: 'Ahmed Hassan',
      age: 34,
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg', 'Metformin 500mg'],
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      vaccines: ['COVID-19', 'Flu 2024', 'Hepatitis B'],
      emergencyContact: '+1-555-0123',
      lastAccessed: '2025-01-15'
    },
    {
      id: 'P002',
      name: 'Kennedy Smith',
      age: 67,
      allergies: ['Aspirin', 'Latex'],
      medications: ['Warfarin 5mg', 'Atorvastatin 20mg'],
      conditions: ['Atrial Fibrillation', 'High Cholesterol'],
      vaccines: ['COVID-19', 'Pneumonia', 'Shingles'],
      emergencyContact: '+1-555-0456',
      lastAccessed: '2025-01-14'
    }
  ];

  const handlePatientSearch = () => {
    if (!patientId.trim() || !patientKey.trim()) {
      setSearchError('Both Patient ID and Access Key are required');
      return;
    }

    // Mock validation
    const patient = recentPatients.find(p => p.id === patientId.toUpperCase());
    if (patient) {
      onPatientSelect(patient);
    } else {
      setSearchError('Invalid Patient ID or Access Key');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedTrack Portal</h1>
                <p className="text-sm text-gray-600">Doctor Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Verified</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">License: {user.licenseNumber}</p>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient Search */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Access Patient Records
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      setSearchError('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Patient ID (e.g., P001)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={patientKey}
                      onChange={(e) => {
                        setPatientKey(e.target.value);
                        setSearchError('');
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Patient Access Key"
                    />
                  </div>
                </div>
                
                {searchError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{searchError}</span>
                  </div>
                )}
                
                <button
                  onClick={handlePatientSearch}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Start Chat with Patient Bot</span>
                </button>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Recent Patient Bots
              </h3>
              
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onPatientSelect(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">
                          Age {patient.age} • Last accessed {patient.lastAccessed}
                        </p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Patients Accessed</span>
                  <span className="text-2xl font-bold text-blue-600">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Chat Sessions</span>
                  <span className="text-2xl font-bold text-green-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical Alerts</span>
                  <span className="text-2xl font-bold text-red-600">2</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Patient Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Chat Service</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security Monitor</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;