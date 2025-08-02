import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import PatientChat from './components/PatientChat';
import PatientChatBot from './components/PatientChatBot';
import UploadRecords from './components/UploadRecords';
import SymptomTracker from './components/SymptomTracker';
import Calendar from './components/Calendar';
import ViewRecords from './components/ViewRecords';
import UserProfile from './components/UserProfile';
import Notifications from './components/Notifications';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export type UserRole = 'doctor' | 'patient';

export type Doctor = {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  verified: boolean;
  role: 'doctor';
  specialty?: string;
  hospital?: string;
  phoneNumber?: string;
  address?: string;
  yearsOfExperience?: string;
  education?: string;
  certifications?: string;
  createdAt?: string;
};

export type PatientUser = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  role: 'patient';
  bloodGroup?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalRecords: MedicalRecord[];
  symptoms: Symptom[];
  appointments: Appointment[];
  createdAt?: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  allergies: string[];
  medications: string[];
  conditions: string[];
  vaccines: string[];
  emergencyContact: string;
  lastAccessed: string;
};

export type MedicalRecord = {
  id: string;
  type: 'image' | 'pdf' | 'text';
  title: string;
  content: string;
  uploadDate: string;
  category: 'allergy' | 'medication' | 'condition' | 'vaccine' | 'test' | 'other';
};

export type Symptom = {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  startDate: string;
  endDate?: string;
  notes: string;
};

export type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'appointment' | 'medication' | 'reminder';
  notes: string;
};

function AppContent() {
  const { currentUser, userProfile, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<
    'landing' | 'auth' | 'doctor-dashboard' | 'patient-dashboard' | 'doctor-chat' | 
    'patient-chat' | 'upload' | 'symptoms' | 'calendar' | 'records' | 'profile' | 'notifications'
  >('landing');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Auto-navigate based on authentication state
  useEffect(() => {
    if (currentUser && userProfile) {
      if (userProfile.role === 'doctor') {
        setCurrentScreen('doctor-dashboard');
      } else {
        setCurrentScreen('patient-dashboard');
      }
    } else if (!currentUser) {
      setCurrentScreen('landing');
    }
  }, [currentUser, userProfile]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentScreen('doctor-chat');
  };

  const handleBackToDoctorDashboard = () => {
    setSelectedPatient(null);
    setCurrentScreen('doctor-dashboard');
  };

  const handleBackToPatientDashboard = () => {
    setCurrentScreen('patient-dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSelectedPatient(null);
      setCurrentScreen('landing');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentScreen === 'landing' && (
        <LandingPage onGetStarted={() => setCurrentScreen('auth')} />
      )}
      
      {currentScreen === 'auth' && (
        <AuthPage 
          onBack={() => setCurrentScreen('landing')}
        />
      )}
      
      {currentScreen === 'doctor-dashboard' && (
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard 
            user={userProfile as Doctor}
            onPatientSelect={handlePatientSelect}
            onLogout={handleLogout}
            onNavigate={(screen) => setCurrentScreen(screen as typeof currentScreen)}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'patient-dashboard' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard 
            user={userProfile as PatientUser}
            onNavigate={(screen) => setCurrentScreen(screen as typeof currentScreen)}
            onLogout={handleLogout}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'doctor-chat' && selectedPatient && (
        <PatientChat 
          patient={selectedPatient}
          onBack={handleBackToDoctorDashboard}
        />
      )}
      
      {currentScreen === 'patient-chat' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientChatBot 
            user={userProfile as PatientUser}
            onBack={handleBackToPatientDashboard}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'upload' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <UploadRecords 
            user={userProfile as PatientUser}
            onBack={handleBackToPatientDashboard}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'symptoms' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <SymptomTracker 
            user={userProfile as PatientUser}
            onBack={handleBackToPatientDashboard}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'calendar' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <Calendar 
            user={userProfile as PatientUser}
            onBack={handleBackToPatientDashboard}
          />
        </ProtectedRoute>
      )}
      
      {currentScreen === 'records' && (
        <ProtectedRoute allowedRoles={['patient']}>
          <ViewRecords 
            user={userProfile as PatientUser}
            onBack={handleBackToPatientDashboard}
          />
        </ProtectedRoute>
      )}

      {currentScreen === 'profile' && (
        <ProtectedRoute allowedRoles={['doctor', 'patient']}>
          <UserProfile 
            onBack={() => {
              if (userProfile?.role === 'doctor') {
                setCurrentScreen('doctor-dashboard');
              } else {
                setCurrentScreen('patient-dashboard');
              }
            }}
          />
        </ProtectedRoute>
      )}

      {currentScreen === 'notifications' && (
        <ProtectedRoute allowedRoles={['doctor', 'patient']}>
          <Notifications 
            user={userProfile as PatientUser}
            onBack={() => {
              if (userProfile?.role === 'doctor') {
                setCurrentScreen('doctor-dashboard');
              } else {
                setCurrentScreen('patient-dashboard');
              }
            }}
          />
        </ProtectedRoute>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;