import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Agreement } from '../types/agreement';

interface AgreementViewProps {
  agreementId: string;
  onBack: () => void;
}

export const AgreementView: React.FC<AgreementViewProps> = ({
  agreementId,
  onBack,
}) => {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAgreement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAgreement(agreementId);
      
      if (response.success && response.data) {
        setAgreement(response.data);
      } else {
        setError(response.message || 'Failed to fetch agreement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  const handleConfirmAgreement = async () => {
    if (!agreement) return;

    try {
      setConfirming(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.confirmAgreement(agreementId);
      
      if (response.success) {
        setSuccess(response.message || 'Agreement confirmed successfully!');
        // Refresh the agreement data
        await fetchAgreement();
      } else {
        setError(response.message || 'Failed to confirm agreement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setConfirming(false);
    }
  };

  const copyShareLink = async () => {
    if (!agreement?.shareLink) return;

    try {
      await navigator.clipboard.writeText(agreement.shareLink);
      setSuccess('Share link copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to copy share link');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              ← Back to Create Agreement
            </button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading agreement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              ← Back to Create Agreement
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error || 'Agreement not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              ← Back to Create Agreement
            </button>
            
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agreement.status)}`}>
                {agreement.status}
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{agreement.title}</h1>
          <p className="text-sm text-gray-600">Agreement ID: {agreement.agreementId}</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Agreement Content */}
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement Terms</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{agreement.content}</p>
            </div>
          </div>

          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Party A</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{agreement.partyA.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{agreement.partyA.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Party B</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{agreement.partyB.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{agreement.partyB.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Created At:</span>
                <span className="text-gray-900">{formatDate(agreement.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Confirmed At:</span>
                <span className="text-gray-900">{formatDate(agreement.confirmedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Proof Hash:</span>
                <span className="text-gray-900 font-mono text-xs">{agreement.proofHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Immutable:</span>
                <span className="text-gray-900">{agreement.isImmutable ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Agreement</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-600 mb-1">Share Link:</p>
                  <p className="text-gray-900 font-mono text-xs break-all">{agreement.shareLink}</p>
                </div>
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            {agreement.status === 'PENDING' && !agreement.isImmutable ? (
              <button
                onClick={handleConfirmAgreement}
                disabled={confirming}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {confirming ? 'Confirming...' : 'Confirm Agreement'}
              </button>
            ) : agreement.status === 'CONFIRMED' ? (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Agreement Confirmed
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};