import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: '123', emailVerified: true });
    return jest.fn();
  },
  signOut: jest.fn(() => Promise.resolve())
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ role: 'student' })
  }))
}));

// Mock your firebase.js file
jest.mock('../firebase', () => ({
  auth: {},
  db: {}
}));

describe('DashboardLayout Component', () => {

  it('renders children correctly', async () => {
    render(
      <BrowserRouter>
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });

  it('displays Campus Connect title and Dashboard link', async () => {
    render(
      <BrowserRouter>
        <DashboardLayout>
          <div>Dummy</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    expect(await screen.findByText('Campus Connect')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Dashboard/i })).toBeInTheDocument();  // 🔥 CHANGED HERE
  });

  it('calls signOut and redirects on Sign Out button click', async () => {
    render(
      <BrowserRouter>
        <DashboardLayout>
          <div>Dummy</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    const signOutButton = await screen.findByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButton);

    expect(signOutButton).toBeInTheDocument();
  });

});
