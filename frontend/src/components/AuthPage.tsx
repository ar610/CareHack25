import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Shield, CheckCircle, Heart } from 'lucide-react';
import { Doctor, PatientUser, UserRole } from '../App';

interface AuthPageProps {
  onLogin: (user: Doctor | PatientUser) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialty: '',
    hospital: '',
    dateOfBirth: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && userRole === 'doctor') {
      // Show verification step for doctor signup
      setIsVerifying(true);
      setTimeout(() => {
        const newDoctor: Doctor = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          verified: true,
          role: 'doctor'
        };
        onLogin(newDoctor);
      }, 2000);
    } else if (!isLogin && userRole === 'patient') {
      // Patient signup
      const newPatient: PatientUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        role: 'patient',
        medicalRecords: [],
        symptoms: [],
        appointments: []
      };
      onLogin(newPatient);
    } else {
      // Login
      if (userRole === 'doctor') {
        const doctor: Doctor = {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: formData.email,
          licenseNumber: 'MD123456',
          verified: true,
          role: 'doctor'
        };
        onLogin(doctor);
      } else {
        const patient: PatientUser = {
          id: '1',
          name: 'John Smith',
          email: formData.email,
          dateOfBirth: '1990-01-01',
          role: 'patient',
          medicalRecords: [
            {
              id: '1',
              type: 'text',
              title: 'Allergy Information',
              content: 'Allergic to Penicillin and Shellfish',
              uploadDate: '2025-01-10',
              category: 'allergy'
            }
          ],
          symptoms: [
            {
              id: '1',
              name: 'Headache',
              severity: 3,
              startDate: '2025-01-15',
              notes: 'Mild headache, started after work stress'
            }
          ],
          appointments: [
            {
              id: '1',
              title: 'Doctor Appointment',
              date: '2025-01-20',
              time: '10:00',
              type: 'appointment',
              notes: 'Regular checkup'
            }
          ]
        };
        onLogin(patient);
      }
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Credentials</h2>
            <p className="text-gray-600">Please wait while we verify your medical license...</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Medical License</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Hospital Affiliation</span>
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Background Check</span>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUserRole('patient')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'patient'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart className="h-4 w-4 inline mr-2" />
                Patient
              </button>
              <button
                onClick={() => setUserRole('doctor')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'doctor'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Doctor
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              userRole === 'doctor' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {userRole === 'doctor' ? (
                <Shield className="h-8 w-8 text-blue-600" />
              ) : (
                <Heart className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? `${userRole === 'doctor' ? 'Doctor' : 'Patient'} Login` : `${userRole === 'doctor' ? 'Doctor' : 'Patient'} Registration`}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Access your secure portal' : `Join as a ${userRole}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={userRole === 'doctor' ? 'Dr. John Smith' : 'John Smith'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={userRole === 'doctor' ? 'doctor@hospital.com' : 'patient@email.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && userRole === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {!isLogin && userRole === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MD123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Specialty</option>
                    <option value="emergency">Emergency Medicine</option>
                    <option value="internal">Internal Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="surgery">Surgery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isLogin ? 'Sign In' : 'Register & Verify'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? `New ${userRole}? Register here` : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;