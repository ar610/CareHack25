import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Activity, Calendar, AlertCircle, TrendingUp, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { PatientUser, Symptom } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { NotificationService } from '../services/notificationService';

interface SymptomTrackerProps {
  user: PatientUser;
  onBack: () => void;
}

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ user, onBack }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const notificationService = NotificationService.getInstance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: 1 as Symptom['severity'],
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const symptom: Symptom = {
        id: Date.now().toString(),
        ...newSymptom
      };

      const updatedSymptoms = [...user.symptoms, symptom];
      await updateUserProfile({ symptoms: updatedSymptoms });

      // Create Firebase notification for the new symptom
      try {
        await notificationService.createSymptomNotification(user.id, symptom);
      } catch (notifError) {
        console.error('Failed to create symptom notification:', notifError);
        // Don't fail the symptom creation if notification fails
      }

      // Reset form
      setNewSymptom({
        name: '',
        severity: 1,
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowAddForm(false);
      setSuccess('Symptom added successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSymptom) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedSymptoms = user.symptoms.map(s => 
        s.id === editingSymptom.id ? editingSymptom : s
      );
      await updateUserProfile({ symptoms: updatedSymptoms });

      setEditingSymptom(null);
      setSuccess('Symptom updated successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    if (!confirm('Are you sure you want to delete this symptom?')) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedSymptoms = user.symptoms.filter(s => s.id !== symptomId);
      await updateUserProfile({ symptoms: updatedSymptoms });
      setSuccess('Symptom deleted successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markSymptomResolved = async (symptomId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedSymptoms = user.symptoms.map(s => 
        s.id === symptomId 
          ? { ...s, endDate: new Date().toISOString().split('T')[0] }
          : s
      );
      await updateUserProfile({ symptoms: updatedSymptoms });
      setSuccess('Symptom marked as resolved!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return 'Very Mild';
      case 2: return 'Mild';
      case 3: return 'Moderate';
      case 4: return 'Severe';
      case 5: return 'Very Severe';
      default: return 'Unknown';
    }
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
                <h1 className="text-xl font-bold text-gray-900">Symptom Tracker</h1>
                <p className="text-sm text-gray-600">Monitor and track your health symptoms</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Symptom</span>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Symptoms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Active Symptoms
              </h2>
              
              <div className="space-y-4">
                {user.symptoms.filter(s => !s.endDate).map((symptom) => (
                  <div key={symptom.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{symptom.name}</h3>
                        <p className="text-sm text-gray-600">Started: {symptom.startDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                          {getSeverityText(symptom.severity)}
                        </span>
                        <button
                          onClick={() => setEditingSymptom(symptom)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          disabled={isLoading}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSymptom(symptom.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => markSymptomResolved(symptom.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Severity Indicator */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600">Severity:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-3 h-3 rounded-full ${
                              level <= symptom.severity ? 'bg-red-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {symptom.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {symptom.notes}
                      </p>
                    )}
                  </div>
                ))}
                
                {user.symptoms.filter(s => !s.endDate).length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active symptoms</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Track your first symptom
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resolved Symptoms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Resolved Symptoms</h2>
              
              <div className="space-y-3">
                {user.symptoms.filter(s => s.endDate).map((symptom) => (
                  <div key={symptom.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{symptom.name}</p>
                      <p className="text-sm text-gray-600">
                        {symptom.startDate} - {symptom.endDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                      {getSeverityText(symptom.severity)}
                    </span>
                  </div>
                ))}
                
                {user.symptoms.filter(s => s.endDate).length === 0 && (
                  <p className="text-gray-600 text-sm">No resolved symptoms yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Symptoms</span>
                  <span className="text-2xl font-bold text-red-600">
                    {user.symptoms.filter(s => !s.endDate).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved This Month</span>
                  <span className="text-2xl font-bold text-green-600">
                    {user.symptoms.filter(s => s.endDate).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tracked</span>
                  <span className="text-2xl font-bold text-blue-600">{user.symptoms.length}</span>
                </div>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Health Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Track symptoms daily for better pattern recognition</p>
                <p>• Note potential triggers like food, stress, or weather</p>
                <p>• Rate severity consistently using the 1-5 scale</p>
                <p>• Share symptom logs with your healthcare provider</p>
                <p>• Seek medical attention for severe or persistent symptoms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Symptom Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Symptom</h2>
            
            <form onSubmit={handleAddSymptom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom Name
                </label>
                <input
                  type="text"
                  required
                  value={newSymptom.name}
                  onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Headache, Nausea, Fatigue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity (1-5)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newSymptom.severity}
                    onChange={(e) => setNewSymptom({...newSymptom, severity: parseInt(e.target.value) as Symptom['severity']})}
                    className="flex-1"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(newSymptom.severity)}`}>
                    {getSeverityText(newSymptom.severity)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={newSymptom.startDate}
                  onChange={(e) => setNewSymptom({...newSymptom, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newSymptom.notes}
                  onChange={(e) => setNewSymptom({...newSymptom, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional details, triggers, or observations..."
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
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Symptom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Symptom Modal */}
      {editingSymptom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Symptom</h2>
            
            <form onSubmit={handleEditSymptom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom Name
                </label>
                <input
                  type="text"
                  required
                  value={editingSymptom.name}
                  onChange={(e) => setEditingSymptom({...editingSymptom, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Headache, Nausea, Fatigue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity (1-5)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={editingSymptom.severity}
                    onChange={(e) => setEditingSymptom({...editingSymptom, severity: parseInt(e.target.value) as Symptom['severity']})}
                    className="flex-1"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(editingSymptom.severity)}`}>
                    {getSeverityText(editingSymptom.severity)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={editingSymptom.startDate}
                  onChange={(e) => setEditingSymptom({...editingSymptom, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editingSymptom.notes}
                  onChange={(e) => setEditingSymptom({...editingSymptom, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional details, triggers, or observations..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSymptom(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Symptom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomTracker;