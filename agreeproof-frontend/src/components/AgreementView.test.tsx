import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgreementView } from './AgreementView';
import { apiService } from '../services/api';
import { Agreement } from '../types/agreement';
import { createMockAgreement, createMockApiResponse } from '../setupTests';

// Mock the API service
jest.mock('../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('AgreementView', () => {
  const mockOnBack = jest.fn();
  const mockAgreementId = 'AGP-20240114-ABC123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (agreementId = mockAgreementId) => {
    return render(<AgreementView agreementId={agreementId} onBack={mockOnBack} />);
  };

  describe('Loading State', () => {
    test('shows loading spinner while fetching agreement', () => {
      // Mock a slow API response
      mockApiService.getAgreement.mockImplementation(() => new Promise(() => {}));

      renderComponent();

      expect(screen.getByText(/Loading agreement\.\.\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('shows error message when agreement is not found', async () => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(null, false, 'Agreement not found')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Agreement not found/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
    });

    test('shows error message when API call fails', async () => {
      mockApiService.getAgreement.mockRejectedValue(new Error('Network error'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
    });

    test('shows back button when agreement is null', async () => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(null, false, 'Not found')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Back to Create Agreement/i }));
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Agreement Display', () => {
    const mockAgreement = createMockAgreement();

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockAgreement)
      );
    });

    test('displays agreement details correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockAgreement.title)).toBeInTheDocument();
      });

      expect(screen.getByText(mockAgreement.content)).toBeInTheDocument();
      expect(screen.getByText(mockAgreement.partyA.name)).toBeInTheDocument();
      expect(screen.getByText(mockAgreement.partyA.email)).toBeInTheDocument();
      expect(screen.getByText(mockAgreement.partyB.name)).toBeInTheDocument();
      expect(screen.getByText(mockAgreement.partyB.email)).toBeInTheDocument();
      expect(screen.getByText(`Agreement ID: ${mockAgreement.agreementId}`)).toBeInTheDocument();
      expect(screen.getByText(mockAgreement.proofHash)).toBeInTheDocument();
    });

    test('displays correct status badge', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('PENDING')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('PENDING');
      expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('displays confirmed status correctly', async () => {
      const confirmedAgreement = createMockAgreement({
        status: 'CONFIRMED',
        confirmedAt: '2024-01-14T11:00:00.000Z',
        isImmutable: true
      });

      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(confirmedAgreement)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('CONFIRMED');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('displays formatted dates correctly', async () => {
      const agreementWithDates = createMockAgreement({
        createdAt: '2024-01-14T10:30:00.000Z',
        confirmedAt: '2024-01-14T11:00:00.000Z'
      });

      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(agreementWithDates)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('14/1/2024, 4:00:00 pm')).toBeInTheDocument();
      });

      expect(screen.getByText('14/1/2024, 4:30:00 pm')).toBeInTheDocument();
    });

    test('displays N/A for missing confirmedAt date', async () => {
      const pendingAgreement = createMockAgreement({
        confirmedAt: undefined
      });

      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(pendingAgreement)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
      });
    });

    test('displays share link correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockAgreement.shareLink)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
    });
  });

  describe('Agreement Confirmation', () => {
    const mockPendingAgreement = createMockAgreement({
      status: 'PENDING',
      isImmutable: false
    });

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockPendingAgreement)
      );
    });

    test('shows confirm button for pending agreements', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Agreement/i })).toBeInTheDocument();
      });
    });

    test('confirms agreement successfully', async () => {
      const confirmedAgreement = createMockAgreement({
        ...mockPendingAgreement,
        status: 'CONFIRMED',
        confirmedAt: '2024-01-14T11:00:00.000Z',
        isImmutable: true
      });

      mockApiService.confirmAgreement.mockResolvedValue(
        createMockApiResponse({
          agreementId: mockPendingAgreement.agreementId,
          status: 'CONFIRMED',
          confirmedAt: '2024-01-14T11:00:00.000Z',
          isImmutable: true
        })
      );

      // Mock the second getAgreement call after confirmation
      mockApiService.getAgreement.mockResolvedValueOnce(
        createMockApiResponse(mockPendingAgreement)
      ).mockResolvedValueOnce(
        createMockApiResponse(confirmedAgreement)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Agreement/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Agreement/i });
      await userEvent.click(confirmButton);

      expect(mockApiService.confirmAgreement).toHaveBeenCalledWith(mockAgreementId);

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      // Should show confirmed state
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });

    test('shows error when confirmation fails', async () => {
      mockApiService.confirmAgreement.mockRejectedValue(new Error('Confirmation failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Agreement/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Agreement/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirmation failed/i)).toBeInTheDocument();
      });
    });

    test('shows error when API returns success: false for confirmation', async () => {
      mockApiService.confirmAgreement.mockResolvedValue(
        createMockApiResponse(null, false, 'Already confirmed')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Agreement/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Agreement/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Already confirmed/i)).toBeInTheDocument();
      });
    });

    test('disables confirm button while confirming', async () => {
      // Mock a slow confirmation response
      mockApiService.confirmAgreement.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => {
          resolve(createMockApiResponse({ status: 'CONFIRMED' }));
        }, 100);
      }));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Agreement/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Agreement/i });
      await userEvent.click(confirmButton);

      // Button should be disabled and show loading text
      expect(confirmButton).toBeDisabled();
      expect(screen.getByText(/Confirming\.\.\./i)).toBeInTheDocument();

      // Wait for the confirmation to complete
      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled();
      });
    });

    test('does not show confirm button for confirmed agreements', async () => {
      const confirmedAgreement = createMockAgreement({
        status: 'CONFIRMED',
        isImmutable: true
      });

      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(confirmedAgreement)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(confirmedAgreement.title)).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /Confirm Agreement/i })).not.toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });
  });

  describe('Share Link Functionality', () => {
    const mockAgreement = createMockAgreement();

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockAgreement)
      );
    });

    test('copies share link to clipboard', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /Copy Link/i });
      await act(async () => {
        await userEvent.click(copyButton);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockAgreement.shareLink);
      expect(screen.getByText(/Share link copied to clipboard!/i)).toBeInTheDocument();
    });

    test('shows error when clipboard copy fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /Copy Link/i });
      await act(async () => {
        await userEvent.click(copyButton);
      });

      expect(screen.getByText(/Failed to copy share link/i)).toBeInTheDocument();
    });

    test('clears success message after 3 seconds', async () => {
      jest.useFakeTimers();

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /Copy Link/i });
      
      // Wrap the click in act to handle state updates
      await act(async () => {
        await userEvent.click(copyButton);
      });

      expect(screen.getByText('Share link copied to clipboard!')).toBeInTheDocument();

      // Fast-forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('Share link copied to clipboard!')).not.toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Navigation', () => {
    const mockAgreement = createMockAgreement();

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockAgreement)
      );
    });

    test('calls onBack when back button is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back to Create Agreement/i });
      await userEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    test('shows back button in both loading and error states', () => {
      // Mock slow response to keep loading state
      mockApiService.getAgreement.mockImplementation(() => new Promise(() => {}));

      renderComponent();

      // Back button should be visible even during loading
      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    test('refetches agreement when agreementId changes', async () => {
      const mockAgreement1 = createMockAgreement({ agreementId: 'ID-1' });
      const mockAgreement2 = createMockAgreement({ agreementId: 'ID-2' });

      mockApiService.getAgreement.mockResolvedValueOnce(
        createMockApiResponse(mockAgreement1)
      ).mockResolvedValueOnce(
        createMockApiResponse(mockAgreement2)
      );

      const { rerender } = renderComponent('ID-1');

      await waitFor(() => {
        expect(screen.getByText(mockAgreement1.title)).toBeInTheDocument();
      });

      // Change agreementId
      rerender(<AgreementView agreementId="ID-2" onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(mockAgreement2.title)).toBeInTheDocument();
      });

      expect(mockApiService.getAgreement).toHaveBeenCalledWith('ID-1');
      expect(mockApiService.getAgreement).toHaveBeenCalledWith('ID-2');
    });

    test('handles empty agreementId gracefully', async () => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(null, false, 'Not found')
      );

      renderComponent('');

      await waitFor(() => {
        expect(screen.getByText(/Not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    const mockAgreement = createMockAgreement();

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockAgreement)
      );
    });

    test('displays correctly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockAgreement.title)).toBeInTheDocument();
      });

      // Should still show all important elements
      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    const mockAgreement = createMockAgreement();

    beforeEach(() => {
      mockApiService.getAgreement.mockResolvedValue(
        createMockApiResponse(mockAgreement)
      );
    });

    test('has proper ARIA labels and roles', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: mockAgreement.title })).toBeInTheDocument();
      });

      // Check for proper semantic structure
      expect(screen.getByRole('button', { name: /Back to Create Agreement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
    });

    test('provides proper feedback for screen readers', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockAgreement.title)).toBeInTheDocument();
      });

      // Status should be properly announced
      const statusBadge = screen.getByText('PENDING');
      expect(statusBadge).toBeInTheDocument();
    });
  });
});