import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Shield, CheckCircle, Heart, AlertCircle } from 'lucide-react';
import { Doctor, PatientUser, UserRole } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { signUp, signIn } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialty: '',
    hospital: '',
    dateOfBirth: '',
    bloodGroup: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    yearsOfExperience: '',
    education: '',
    certifications: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        if (userRole === 'doctor') {
          // Show verification step for doctor signup
          setIsVerifying(true);
          setIsLoading(false);
          
          // Simulate verification process
          setTimeout(async () => {
            try {
              const doctorData: Partial<Doctor> = {
                name: formData.name,
                licenseNumber: formData.licenseNumber,
                verified: true,
                role: 'doctor',
                specialty: formData.specialty,
                hospital: formData.hospital,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                yearsOfExperience: formData.yearsOfExperience,
                education: formData.education,
                certifications: formData.certifications
              };
              
              await signUp(formData.email, formData.password, doctorData);
            } catch (error: any) {
              setError(error.message);
              setIsVerifying(false);
            }
          }, 2000);
        } else {
          // Patient signup
          const patientData: Partial<PatientUser> = {
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            role: 'patient',
            bloodGroup: formData.bloodGroup,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
            medicalRecords: [],
            symptoms: [],
            appointments: []
          };
          
          await signUp(formData.email, formData.password, patientData);
        }
      } else {
        // Login
        await signIn(formData.email, formData.password);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

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

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}



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

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {!isLogin && userRole === 'patient' && (
              <div className="space-y-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            {!isLogin && userRole === 'doctor' && (
              <div className="space-y-4">
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
                    <option value="dermatology">Dermatology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hospital}
                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hospital or clinic name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your practice address"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <select
                    required
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Years of Experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-15">11-15 years</option>
                    <option value="16-20">16-20 years</option>
                    <option value="20+">20+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <textarea
                    required
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Medical school, degrees, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Board certifications, specializations, etc."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Register & Verify'
              )}
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