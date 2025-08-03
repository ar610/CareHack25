import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, Heart, Edit3, Save, X, Award, GraduationCap, Building, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Doctor, PatientUser } from '../App';

interface UserProfileProps {
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
    address: userProfile?.address || '',
    // Doctor specific fields
    licenseNumber: (userProfile as Doctor)?.licenseNumber || '',
    specialty: (userProfile as Doctor)?.specialty || '',
    hospital: (userProfile as Doctor)?.hospital || '',
    yearsOfExperience: (userProfile as Doctor)?.yearsOfExperience || '',
    education: (userProfile as Doctor)?.education || '',
    certifications: (userProfile as Doctor)?.certifications || '',
    // Patient specific fields
    dateOfBirth: (userProfile as PatientUser)?.dateOfBirth || '',
    bloodGroup: (userProfile as PatientUser)?.bloodGroup || '',
    emergencyContact: (userProfile as PatientUser)?.emergencyContact || '',
    emergencyPhone: (userProfile as PatientUser)?.emergencyPhone || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: Partial<Doctor | PatientUser> = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      };

      if (userProfile?.role === 'doctor') {
        Object.assign(updateData, {
          licenseNumber: formData.licenseNumber,
          specialty: formData.specialty,
          hospital: formData.hospital,
          yearsOfExperience: formData.yearsOfExperience,
          education: formData.education,
          certifications: formData.certifications,
        });
      } else if (userProfile?.role === 'patient') {
        Object.assign(updateData, {
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
        });
      }

      await updateUserProfile(updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      address: userProfile?.address || '',
      licenseNumber: (userProfile as Doctor)?.licenseNumber || '',
      specialty: (userProfile as Doctor)?.specialty || '',
      hospital: (userProfile as Doctor)?.hospital || '',
      yearsOfExperience: (userProfile as Doctor)?.yearsOfExperience || '',
      education: (userProfile as Doctor)?.education || '',
      certifications: (userProfile as Doctor)?.certifications || '',
      dateOfBirth: (userProfile as PatientUser)?.dateOfBirth || '',
      bloodGroup: (userProfile as PatientUser)?.bloodGroup || '',
      emergencyContact: (userProfile as PatientUser)?.emergencyContact || '',
      emergencyPhone: (userProfile as PatientUser)?.emergencyPhone || '',
    });
    setIsEditing(false);
    setError('');
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  const isDoctor = userProfile.role === 'doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDoctor ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {isDoctor ? (
                <Shield className="h-6 w-6 text-blue-600" />
              ) : (
                <Heart className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDoctor ? 'Doctor' : 'Patient'} Profile
              </h1>
              <p className="text-gray-600">
                {isDoctor ? 'Manage your professional information' : 'Manage your personal information'}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Save className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <p className="text-gray-900">{userProfile.email}</p>
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-Specific Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                {isDoctor ? (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Professional Information
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Medical Information
                  </>
                )}
              </h2>

              {isDoctor ? (
                // Doctor specific fields
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    {isEditing ? (
                      <select
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
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).specialty || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital/Clinic
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.hospital}
                        onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).hospital || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <select
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
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).yearsOfExperience || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Medical school, degrees, etc."
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).education || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.certifications}
                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Board certifications, specializations, etc."
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as Doctor).certifications || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              ) : (
                // Patient specific fields
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as PatientUser).dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
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
                    ) : (
                      <p className="text-gray-900">{(userProfile as PatientUser).bloodGroup || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as PatientUser).emergencyContact || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900">{(userProfile as PatientUser).emergencyPhone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Role</span>
                </div>
                <p className="text-gray-900 font-semibold capitalize">{userProfile.role}</p>
              </div>

              {isDoctor && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Verification Status</span>
                  </div>
                  <p className={`font-semibold ${(userProfile as Doctor).verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(userProfile as Doctor).verified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Member Since</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 