// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch API for testing
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test utilities
export const createMockAgreement = (overrides = {}) => ({
  agreementId: 'AGP-20240114-ABC123',
  title: 'Test Agreement',
  content: 'This is a test agreement content.',
  partyA: {
    name: 'John Doe',
    email: 'john.doe@example.com'
  },
  partyB: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com'
  },
  status: 'PENDING',
  proofHash: 'a'.repeat(64),
  shareLink: 'https://agreeproof.com/agreement/AGP-20240114-ABC123',
  createdAt: '2024-01-14T10:30:00.000Z',
  updatedAt: '2024-01-14T10:30:00.000Z',
  confirmedAt: undefined,
  isImmutable: false,
  ...overrides
});

export const createMockApiResponse = (data: any, success = true, message = 'Success') => ({
  success,
  message,
  data
});

export const mockFetchResponse = (data: any, status = 200) => {
  (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response);
};

export const mockFetchError = (message = 'Network error') => {
  (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error(message));
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
