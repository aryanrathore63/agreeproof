import React, { useState } from 'react';
import { CreateAgreementForm } from './components/CreateAgreementForm';
import { AgreementView } from './components/AgreementView';
import { Agreement } from './types/agreement';

function App() {
  const [currentAgreement, setCurrentAgreement] = useState<Agreement | null>(null);
  const [activeView, setActiveView] = useState<'create' | 'view'>('create');

  const handleAgreementCreated = (agreement: Agreement) => {
    setCurrentAgreement(agreement);
    setActiveView('view');
  };

  const handleBackToCreate = () => {
    setCurrentAgreement(null);
    setActiveView('create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AgreeProof</h1>
              <span className="ml-2 text-sm text-gray-500">Secure Agreement Management</span>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveView('create')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'create'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Create Agreement
              </button>
              <button
                onClick={() => setActiveView('view')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'view'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                View Agreement
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeView === 'create' ? (
            <CreateAgreementForm onAgreementCreated={handleAgreementCreated} />
          ) : (
            <AgreementView
              agreementId={currentAgreement?.agreementId || ''}
              onBack={handleBackToCreate}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 AgreeProof. All rights reserved. | Powered by blockchain-secure verification
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
