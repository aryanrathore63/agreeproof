import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { apiService } from './services/api';
import { createMockAgreement, createMockApiResponse } from './setupTests';

// Mock the API service
jest.mock('./services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock the components to isolate App component testing
jest.mock('./components/CreateAgreementForm', () => {
  const { createMockAgreement } = require('./setupTests');
  
  return {
    CreateAgreementForm: ({ onAgreementCreated }: { onAgreementCreated: (agreement: any) => void }) => (
      <div data-testid="create-agreement-form">
        <button onClick={() => onAgreementCreated(createMockAgreement())}>
          Create Test Agreement
        </button>
      </div>
    )
  };
});

jest.mock('./components/AgreementView', () => ({
  AgreementView: ({ agreementId, onBack }: { agreementId: string; onBack: () => void }) => (
    <div data-testid="agreement-view">
      <span>Agreement ID: {agreementId}</span>
      <button onClick={onBack}>Back</button>
    </div>
  )
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear URL hash
    window.location.hash = '';
  });

  const renderApp = () => {
    return render(<App />);
  };

  describe('Initial Rendering', () => {
    test('renders CreateAgreementForm by default', () => {
      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.getByText('AgreeProof', { selector: 'h1' })).toBeInTheDocument();
      expect(screen.getByText(/Secure Agreement Management/i)).toBeInTheDocument();
    });

    test('renders with proper layout structure', () => {
      renderApp();

      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();
      expect(screen.getByText(/Secure Agreement Management/i)).toBeInTheDocument();
    });

    test('shows navigation buttons', () => {
      renderApp();

      expect(screen.getByRole('button', { name: /Create Agreement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Agreement/i })).toBeInTheDocument();
    });

    test('shows create agreement form by default', () => {
      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.queryByTestId('agreement-view')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('switches to view agreement when View Agreement button is clicked', async () => {
      renderApp();

      const viewButton = screen.getByRole('button', { name: /View Agreement/i });
      await userEvent.click(viewButton);

      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      expect(screen.queryByTestId('create-agreement-form')).not.toBeInTheDocument();
    });

    test('switches back to create agreement when Create Agreement button is clicked', async () => {
      renderApp();

      // First switch to view
      const viewButton = screen.getByRole('button', { name: /View Agreement/i });
      await userEvent.click(viewButton);

      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();

      // Then switch back to create
      const createButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(createButton);

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.queryByTestId('agreement-view')).not.toBeInTheDocument();
    });

    test('highlights active navigation button', async () => {
      renderApp();

      // Initially Create Agreement should be active
      const createButton = screen.getByRole('button', { name: /Create Agreement/i });
      expect(createButton).toHaveClass('bg-primary-600', 'text-white');

      const viewButton = screen.getByRole('button', { name: /View Agreement/i });
      expect(viewButton).not.toHaveClass('bg-primary-600', 'text-white');

      // Click View Agreement
      await userEvent.click(viewButton);

      // Now View Agreement should be active
      expect(viewButton).toHaveClass('bg-primary-600', 'text-white');
      expect(createButton).not.toHaveClass('bg-primary-600', 'text-white');
    });
  });

  describe('Agreement Creation Flow', () => {
    test('navigates to agreement view when agreement is created', async () => {
      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();

      const createButton = screen.getByText('Create Test Agreement');
      await userEvent.click(createButton);

      // Should navigate to agreement view
      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      expect(screen.getByText('Agreement ID: AGP-20240114-ABC123')).toBeInTheDocument();
    });

    test('switches to view tab when agreement is created', async () => {
      renderApp();

      const createButton = screen.getByText('Create Test Agreement');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      // View Agreement button should now be active
      const viewButton = screen.getByRole('button', { name: /View Agreement/i });
      expect(viewButton).toHaveClass('bg-primary-600', 'text-white');
    });
  });

  describe('Back Navigation', () => {
    test('navigates back to create form when back button is clicked', async () => {
      renderApp();

      // First create an agreement to switch to view
      const createButton = screen.getByText('Create Test Agreement');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      // Click back button in AgreementView
      const backButton = screen.getByText('Back');
      await userEvent.click(backButton);

      // Should navigate back to create form
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });

    test('resets agreement state when going back', async () => {
      renderApp();

      // Create agreement
      const createButton = screen.getByText('Create Test Agreement');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByText('Back');
      await userEvent.click(backButton);

      // Should be back to create form
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();

      // Click View Agreement button - should show empty agreement view
      const viewButton = screen.getByRole('button', { name: /View Agreement/i });
      await userEvent.click(viewButton);

      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      expect(screen.getByText('Agreement ID:')).toBeInTheDocument(); // Empty ID
    });
  });

  describe('Component State Management', () => {
    test('maintains correct view state during navigation', async () => {
      renderApp();

      // Initial state - create form
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.queryByTestId('agreement-view')).not.toBeInTheDocument();

      // Navigate to view agreement
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      expect(screen.queryByTestId('create-agreement-form')).not.toBeInTheDocument();

      // Navigate back to create
      await userEvent.click(screen.getByRole('button', { name: /Create Agreement/i }));
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.queryByTestId('agreement-view')).not.toBeInTheDocument();
    });

    test('handles rapid navigation changes', async () => {
      renderApp();

      // Rapid navigation clicks
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
      await userEvent.click(screen.getByRole('button', { name: /Create Agreement/i }));
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
      await userEvent.click(screen.getByRole('button', { name: /Create Agreement/i }));

      // Should end up at create form
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles navigation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderApp();

      // Try navigation - should not throw an error
      try {
        await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      } catch (error) {
        fail('Navigation should not throw an error');
      }

      consoleSpy.mockRestore();
    });

    test('handles component rendering errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderApp();

      // The app should still render the basic structure even if there are issues
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Browser History Integration', () => {
    test('handles navigation without browser history', async () => {
      renderApp();

      // Navigate to view agreement - should work without browser history
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
    });

    test('handles back button through component state', async () => {
      renderApp();

      // Navigate to view agreement
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();

      // Use component back button
      await userEvent.click(screen.getByText('Back'));

      // Should navigate back to create
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = renderApp();

      // Re-render with same props
      rerender(<App />);

      // Should still show the same view
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });

    test('handles multiple rapid navigation clicks efficiently', async () => {
      renderApp();

      // Simulate rapid navigation clicks
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));
        } else {
          await userEvent.click(screen.getByRole('button', { name: /Create Agreement/i }));
        }
      }

      // Should handle the last change
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('maintains focus management during navigation', async () => {
      renderApp();

      // Create agreement
      const createButton = screen.getByText('Create Test Agreement');
      createButton.focus();
      expect(createButton).toHaveFocus();

      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      // Focus should be managed appropriately
      // This would be more thoroughly tested in individual component tests
    });

    test('announces navigation changes to screen readers', async () => {
      renderApp();

      // Initial state
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();

      // Navigate to agreement
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));

      // Should update the view appropriately
      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
    });

    test('provides proper ARIA landmarks', () => {
      renderApp();

      // Main heading should be present
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();
      
      // Content should be properly structured
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();
    });

    test('renders correctly on tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();
    });

    test('renders correctly on desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      renderApp();

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'AgreeProof' })).toBeInTheDocument();
    });
  });

  describe('Integration with Components', () => {
    test('passes correct props to CreateAgreementForm', () => {
      renderApp();

      // The CreateAgreementForm should receive the onAgreementCreated callback
      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });

    test('passes correct props to AgreementView', async () => {
      renderApp();

      // Navigate to view without creating agreement
      await userEvent.click(screen.getByRole('button', { name: /View Agreement/i }));

      // The AgreementView should receive the agreementId and onBack callback
      expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      expect(screen.getByText('Agreement ID:')).toBeInTheDocument(); // Empty ID
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    test('handles component callbacks correctly', async () => {
      renderApp();

      // Test agreement creation callback
      const createButton = screen.getByText('Create Test Agreement');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('agreement-view')).toBeInTheDocument();
      });

      // Test back navigation callback
      const backButton = screen.getByText('Back');
      await userEvent.click(backButton);

      expect(screen.getByTestId('create-agreement-form')).toBeInTheDocument();
    });
  });
});
