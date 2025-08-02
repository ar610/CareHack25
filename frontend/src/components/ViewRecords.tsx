import React, { useState } from 'react';
import { ArrowLeft, FileText, Image, File, Edit, Trash2, Search, Filter } from 'lucide-react';
import { PatientUser, MedicalRecord } from '../App';

interface ViewRecordsProps {
  user: PatientUser;
  onBack: () => void;
}

const ViewRecords: React.FC<ViewRecordsProps> = ({ user, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  const filteredRecords = user.medicalRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-green-600" />;
      case 'pdf': return <File className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: MedicalRecord['category']) => {
    switch (category) {
      case 'allergy': return 'bg-red-100 text-red-800';
      case 'medication': return 'bg-blue-100 text-blue-800';
      case 'condition': return 'bg-purple-100 text-purple-800';
      case 'vaccine': return 'bg-green-100 text-green-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving edited record:', editingRecord);
    setEditingRecord(null);
    alert('Record updated successfully!');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      console.log('Deleting record:', recordId);
      alert('Record deleted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-bold text-gray-900">Medical Records</h1>
              <p className="text-sm text-gray-600">View and manage your medical documents</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search records..."
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="allergy">Allergies</option>
                  <option value="medication">Medications</option>
                  <option value="condition">Conditions</option>
                  <option value="vaccine">Vaccines</option>
                  <option value="test">Test Results</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredRecords.length} of {user.medicalRecords.length} records
              </div>
            </div>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(record.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.uploadDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditRecord(record)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(record.category)}`}>
                  {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {record.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  record.type === 'image' ? 'bg-green-100 text-green-800' :
                  record.type === 'pdf' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.type.toUpperCase()}
                </span>
                
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t uploaded any medical records yet'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload your first record
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Record</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={editingRecord.category}
                  onChange={(e) => setEditingRecord({...editingRecord, category: e.target.value as MedicalRecord['category']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="other">Other</option>
                  <option value="allergy">Allergy Information</option>
                  <option value="medication">Medication</option>
                  <option value="condition">Medical Condition</option>
                  <option value="vaccine">Vaccination</option>
                  <option value="test">Test Results</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={editingRecord.content}
                  onChange={(e) => setEditingRecord({...editingRecord, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRecords;