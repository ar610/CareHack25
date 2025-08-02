import { useState } from 'react';
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

export type UserRole = 'doctor' | 'patient';

export type Doctor = {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  verified: boolean;
  role: 'doctor';
};

export type PatientUser = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  role: 'patient';
  medicalRecords: MedicalRecord[];
  symptoms: Symptom[];
  appointments: Appointment[];
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

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'landing' | 'auth' | 'doctor-dashboard' | 'patient-dashboard' | 'doctor-chat' | 
    'patient-chat' | 'upload' | 'symptoms' | 'calendar' | 'records'
  >('landing');
  const [currentUser, setCurrentUser] = useState<Doctor | PatientUser | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleLogin = (user: Doctor | PatientUser) => {
    setCurrentUser(user);
    if (user.role === 'doctor') {
      setCurrentScreen('doctor-dashboard');
    } else {
      setCurrentScreen('patient-dashboard');
    }
  };

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

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
    setCurrentScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentScreen === 'landing' && (
        <LandingPage onGetStarted={() => setCurrentScreen('auth')} />
      )}
      
      {currentScreen === 'auth' && (
        <AuthPage 
          onLogin={handleLogin}
          onBack={() => setCurrentScreen('landing')}
        />
      )}
      
      {currentScreen === 'doctor-dashboard' && currentUser && currentUser.role === 'doctor' && (
        <DoctorDashboard 
          user={currentUser}
          onPatientSelect={handlePatientSelect}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'patient-dashboard' && currentUser && currentUser.role === 'patient' && (
        <PatientDashboard 
          user={currentUser}
          onNavigate={(screen) => setCurrentScreen(screen as typeof currentScreen)}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'doctor-chat' && selectedPatient && (
        <PatientChat 
          patient={selectedPatient}
          onBack={handleBackToDoctorDashboard}
        />
      )}
      
      {currentScreen === 'patient-chat' && currentUser && currentUser.role === 'patient' && (
        <PatientChatBot 
          user={currentUser}
          onBack={handleBackToPatientDashboard}
        />
      )}
      
      {currentScreen === 'upload' && currentUser && currentUser.role === 'patient' && (
        <UploadRecords 
          user={currentUser}
          onBack={handleBackToPatientDashboard}
        />
      )}
      
      {currentScreen === 'symptoms' && currentUser && currentUser.role === 'patient' && (
        <SymptomTracker 
          user={currentUser}
          onBack={handleBackToPatientDashboard}
        />
      )}
      
      {currentScreen === 'calendar' && currentUser && currentUser.role === 'patient' && (
        <Calendar 
          user={currentUser}
          onBack={handleBackToPatientDashboard}
        />
      )}
      
      {currentScreen === 'records' && currentUser && currentUser.role === 'patient' && (
        <ViewRecords 
          user={currentUser}
          onBack={handleBackToPatientDashboard}
        />
      )}
    </div>
  );
}

export default App;