import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Agreement, CreateAgreementRequest } from '../types/agreement';

interface CreateAgreementFormProps {
  onAgreementCreated: (agreement: Agreement) => void;
}

export const CreateAgreementForm: React.FC<CreateAgreementFormProps> = ({
  onAgreementCreated,
}) => {
  const [formData, setFormData] = useState<CreateAgreementRequest>({
    title: '',
    content: '',
    partyA: {
      name: '',
      email: '',
    },
    partyB: {
      name: '',
      email: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        if (parent === 'partyA') {
          return {
            ...prev,
            partyA: {
              ...prev.partyA,
              [child]: value,
            },
          };
        } else if (parent === 'partyB') {
          return {
            ...prev,
            partyB: {
              ...prev.partyB,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    if (!formData.content.trim()) {
      return 'Content is required';
    }
    if (!formData.partyA.name.trim()) {
      return 'Party A name is required';
    }
    if (!formData.partyA.email.trim()) {
      return 'Party A email is required';
    }
    if (!formData.partyB.name.trim()) {
      return 'Party B name is required';
    }
    if (!formData.partyB.email.trim()) {
      return 'Party B email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.partyA.email)) {
      return 'Party A email is invalid';
    }
    if (!emailRegex.test(formData.partyB.email)) {
      return 'Party B email is invalid';
    }
    
    if (formData.partyA.email.toLowerCase() === formData.partyB.email.toLowerCase()) {
      return 'Party A and Party B cannot be the same';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createAgreement(formData);
      
      if (response.success && response.data) {
        setSuccess('Agreement created successfully!');
        
        // Fetch the full agreement details
        const fullAgreementResponse = await apiService.getAgreement(response.data.agreementId);
        
        if (fullAgreementResponse.success && fullAgreementResponse.data) {
          onAgreementCreated(fullAgreementResponse.data);
        }
      } else {
        setError(response.message || 'Failed to create agreement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      partyA: {
        name: '',
        email: '',
      },
      partyB: {
        name: '',
        email: '',
      },
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Agreement</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Agreement Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter agreement title"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Agreement Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter agreement terms and conditions"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Party A</h3>
              
              <div>
                <label htmlFor="partyA.name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="partyA.name"
                  name="partyA.name"
                  value={formData.partyA.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter Party A name"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="partyA.email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="partyA.email"
                  name="partyA.email"
                  value={formData.partyA.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter Party A email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Party B</h3>
              
              <div>
                <label htmlFor="partyB.name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="partyB.name"
                  name="partyB.name"
                  value={formData.partyB.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter Party B name"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="partyB.email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="partyB.email"
                  name="partyB.email"
                  value={formData.partyB.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter Party B email"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Agreement...' : 'Create Agreement'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};