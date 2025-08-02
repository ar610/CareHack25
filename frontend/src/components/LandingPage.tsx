import React from 'react';
import { Activity, Shield, MessageCircle, Users, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MedTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Doctor Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI-Powered Medical Records</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Manage Medical Records
              <span className="block text-blue-600">For Doctors & Patients</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A comprehensive platform for doctors to access patient records and for patients to manage their medical information with AI-powered assistance.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Secure authentication for both doctors and patients with appropriate permissions</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chat Interface</h3>
              <p className="text-gray-600">AI-powered chatbots for both patient self-care and doctor consultations</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Ready</h3>
              <p className="text-gray-600">Complete medical records and symptom tracking for emergency situations</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">© 2025 MedTrack. Secure medical record management for healthcare professionals.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;