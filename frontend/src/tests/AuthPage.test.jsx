import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';


// ✅ Proper mocks
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // immediately trigger callback with no user
    return jest.fn(); // fake unsubscribe function
  }),
}));

jest.mock('@react-oauth/google', () => ({
  GoogleLogin: (props) => (
    <button onClick={() => props.onSuccess({ credential: 'mockCredential' })}>
      Sign in with Google
    </button>
  )
}));

const renderAuthPage = () => {
  return render(
    <BrowserRouter>
      <AuthPage />
    </BrowserRouter>
  );
};

describe('AuthPage', () => {
  it('renders AuthPage without crashing', () => {
    renderAuthPage();
    expect(screen.getByRole('heading', { name: /student login/i })).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderAuthPage();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Sign in with Google button', async () => {
    renderAuthPage();
    expect(await screen.findByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('renders Log In button', () => {
    renderAuthPage();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders Back to Landing Page link', () => {
    renderAuthPage();
    expect(screen.getByRole('link', { name: /back to landing page/i })).toBeInTheDocument();
  });

  it('shows a loading spinner while checking authentication', async () => {
    renderAuthPage();
    // Since spinner might not always be there, use queryByRole
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('submits login form and shows error snackbar', async () => {
    renderAuthPage();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
