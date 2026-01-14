import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateAgreementForm } from './CreateAgreementForm';
import { apiService } from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockCreateAgreement = apiService.createAgreement as jest.MockedFunction<typeof apiService.createAgreement>;


describe('CreateAgreementForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnAgreementCreated = jest.fn();
  
  const renderComponent = () => {
    return render(<CreateAgreementForm onAgreementCreated={mockOnAgreementCreated} />);
  };

  describe('Form Rendering', () => {
    test('renders all form fields', () => {
      renderComponent();

      expect(screen.getByLabelText(/Agreement Title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Agreement Content \*/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Name \*/i)).toHaveLength(2);
      expect(screen.getAllByLabelText(/Email \*/i)).toHaveLength(2);
      expect(screen.getByRole('button', { name: /Create Agreement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Form/i })).toBeInTheDocument();
    });

    test('renders with proper placeholders', () => {
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i) as HTMLInputElement;
      const contentInput = screen.getByLabelText(/Agreement Content \*/i) as HTMLTextAreaElement;
      const nameInputs = screen.getAllByLabelText(/Name \*/i) as HTMLInputElement[];
      const emailInputs = screen.getAllByLabelText(/Email \*/i) as HTMLInputElement[];

      expect(titleInput.placeholder).toBe('Enter agreement title');
      expect(contentInput.placeholder).toBe('Enter agreement terms and conditions');
      expect(nameInputs[0].placeholder).toBe('Enter Party A name');
      expect(emailInputs[0].placeholder).toBe('Enter Party A email');
      expect(nameInputs[1].placeholder).toBe('Enter Party B name');
      expect(emailInputs[1].placeholder).toBe('Enter Party B email');
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for invalid Party A email on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      
      // Fill ALL required fields first, then test invalid email
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'invalid-email'); // Invalid email
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party A email is invalid/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for invalid Party B email on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      
      // Fill ALL required fields first, then test invalid email
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'invalid-email'); // Invalid email
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party B email is invalid/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty title on submission', async () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty content on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      await userEvent.type(titleInput, 'Test Agreement');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Content is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty Party A name on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'Test content');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party A name is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty Party A email on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const partyANameInput = screen.getAllByLabelText(/Name \*/i)[0];
      
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.type(partyANameInput, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party A email is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty Party B name on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const partyANameInput = screen.getAllByLabelText(/Name \*/i)[0];
      const partyAEmailInput = screen.getAllByLabelText(/Email \*/i)[0];
      
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.type(partyANameInput, 'John Doe');
      await userEvent.type(partyAEmailInput, 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party B name is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for empty Party B email on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const partyANameInput = screen.getAllByLabelText(/Name \*/i)[0];
      const partyAEmailInput = screen.getAllByLabelText(/Email \*/i)[0];
      const partyBNameInput = screen.getAllByLabelText(/Name \*/i)[1];
      
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.type(partyANameInput, 'John Doe');
      await userEvent.type(partyAEmailInput, 'john@example.com');
      await userEvent.type(partyBNameInput, 'Jane Smith');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party B email is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation error for same email addresses on submission', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      
      // Fill ALL required fields first, then test same email
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'test@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'test@example.com'); // Same email
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party A and Party B cannot be the same/i)).toBeInTheDocument();
      });
    });

    test('clears validation errors when form is reset', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      
      // Fill ALL required fields first, then trigger validation error
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'invalid-email'); // Invalid email
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Party A email is invalid/i)).toBeInTheDocument();
      });

      // Reset form
      const resetButton = screen.getByRole('button', { name: /Reset Form/i });
      await userEvent.click(resetButton);

      // Verify validation error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/Party A email is invalid/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const mockAgreementResponse = {
      agreementId: 'AGP-20240114-ABC123',
      shareLink: 'https://agreeproof.com/agreement/AGP-20240114-ABC123',
      message: 'Agreement created successfully',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    test('submits form with valid data', async () => {
      mockCreateAgreement.mockResolvedValue({
        success: true,
        message: 'Agreement created successfully',
        data: mockAgreementResponse
      });
      
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateAgreement).toHaveBeenCalledWith({
          title: 'Test Agreement',
          content: 'This is a test agreement content.',
          partyA: {
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          partyB: {
            name: 'Jane Smith',
            email: 'jane.smith@example.com'
          }
        });
      });

      expect(mockOnAgreementCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: 'AGP-20240114-ABC123'
        })
      );
    });

    test('shows loading state during submission', async () => {
      mockCreateAgreement.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      // Check loading state
      expect(screen.getByText(/Creating agreement.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('shows error message on submission failure', async () => {
      const errorMessage = 'Failed to create agreement';
      mockCreateAgreement.mockRejectedValue(new Error(errorMessage));
      
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnAgreementCreated).not.toHaveBeenCalled();
    });

    test('does not submit form with invalid data', async () => {
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      // Fill with invalid data
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'invalid-email'); // Invalid email
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Party A email is invalid/i)).toBeInTheDocument();
      });

      expect(mockCreateAgreement).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    test('resets form when reset button is clicked', async () => {
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i) as HTMLInputElement;
      const contentInput = screen.getByLabelText(/Agreement Content \*/i) as HTMLTextAreaElement;
      const nameInputs = screen.getAllByLabelText(/Name \*/i) as HTMLInputElement[];
      const emailInputs = screen.getAllByLabelText(/Email \*/i) as HTMLInputElement[];

      // Fill form with data
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      // Verify data is entered
      expect(titleInput.value).toBe('Test Agreement');
      expect(contentInput.value).toBe('This is a test agreement content.');
      expect(nameInputs[0].value).toBe('John Doe');
      expect(emailInputs[0].value).toBe('john.doe@example.com');
      expect(nameInputs[1].value).toBe('Jane Smith');
      expect(emailInputs[1].value).toBe('jane.smith@example.com');

      // Reset form
      const resetButton = screen.getByRole('button', { name: /Reset Form/i });
      await userEvent.click(resetButton);

      // Verify form is reset
      expect(titleInput.value).toBe('');
      expect(contentInput.value).toBe('');
      expect(nameInputs[0].value).toBe('');
      expect(emailInputs[0].value).toBe('');
      expect(nameInputs[1].value).toBe('');
      expect(emailInputs[1].value).toBe('');
    });

    test('clears validation errors when form is reset', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const partyAEmailInput = screen.getAllByLabelText(/Email \*/i)[0];
      
      // Fill form with valid data except invalid email to trigger validation error
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(partyAEmailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Party A email is invalid/i)).toBeInTheDocument();
      });

      // Reset form
      const resetButton = screen.getByRole('button', { name: /Reset Form/i });
      await userEvent.click(resetButton);

      // Verify validation error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/Party A email is invalid/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Input Field Behavior', () => {
    test('trims whitespace from email inputs on submission', async () => {
      renderComponent();
      
      // Fill all required fields
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);
      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      
      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'Test Content');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[0], '  test@example.com  ');
      await userEvent.type(emailInputs[1], 'jane@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInputs[0]).toHaveValue('test@example.com');
      });
    });

    test('prevents submission with only whitespace', async () => {
      renderComponent();
      
      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      // Fill with whitespace only
      await userEvent.type(titleInput, '   ');
      await userEvent.type(contentInput, '   ');
      await userEvent.type(nameInputs[0], '   ');
      await userEvent.type(emailInputs[0], '   ');
      await userEvent.type(nameInputs[1], '   ');
      await userEvent.type(emailInputs[1], '   ');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });

      expect(mockCreateAgreement).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      renderComponent();

      expect(screen.getByLabelText(/Agreement Title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Agreement Content \*/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Name \*/i)).toHaveLength(2);
      expect(screen.getAllByLabelText(/Email \*/i)).toHaveLength(2);
    });

    test('buttons have accessible names', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /Create Agreement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Form/i })).toBeInTheDocument();
    });

    test('shows loading state with accessible text', async () => {
      mockCreateAgreement.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderComponent();

      const titleInput = screen.getByLabelText(/Agreement Title \*/i);
      const contentInput = screen.getByLabelText(/Agreement Content \*/i);
      const nameInputs = screen.getAllByLabelText(/Name \*/i);
      const emailInputs = screen.getAllByLabelText(/Email \*/i);

      await userEvent.type(titleInput, 'Test Agreement');
      await userEvent.type(contentInput, 'This is a test agreement content.');
      await userEvent.type(nameInputs[0], 'John Doe');
      await userEvent.type(emailInputs[0], 'john.doe@example.com');
      await userEvent.type(nameInputs[1], 'Jane Smith');
      await userEvent.type(emailInputs[1], 'jane.smith@example.com');

      const submitButton = screen.getByRole('button', { name: /Create Agreement/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/Creating agreement.../i)).toBeInTheDocument();
    });
  });
});