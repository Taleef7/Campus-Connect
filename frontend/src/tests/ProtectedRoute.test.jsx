import '@testing-library/jest-dom';
// src/tests/ProtectedRoute.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// ✅ Correct Firebase mock
jest.mock('../firebase', () => {
  return {
    auth: {
      onAuthStateChanged: (callback) => {
        // Immediately call the callback with a mock user
        const mockUser = { emailVerified: true }; // You can toggle true/false to test different behaviors
        callback(mockUser);
        return jest.fn(); // Mock the unsubscribe function
      },
    },
  };
});

describe('ProtectedRoute Component', () => {
  it('renders children when authenticated and email verified', async () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
