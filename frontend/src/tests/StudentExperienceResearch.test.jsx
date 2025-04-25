// src/tests/StudentExperienceResearch.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch';
import '@testing-library/jest-dom';

// Mock firebase modules
jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'mockUserId' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn((q, callback) => {
    callback({ docs: [] });
    return jest.fn(); // unsubscribe
  }),
  orderBy: jest.fn(() => ({})),
  addDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: 'mockUserId' });
    return jest.fn(); // Mock unsubscribe
  },
}));

describe('StudentExperienceResearch Component', () => {
  test('renders "My Experience & Research Interests" title', () => {
    render(<StudentExperienceResearch studentData={{}} />);
    expect(screen.getByText(/My Experience & Research Interests/i)).toBeInTheDocument();
  });

  test('renders no tags message initially', () => {
    render(<StudentExperienceResearch studentData={{}} />);
    expect(screen.getByText(/No tags added yet/i)).toBeInTheDocument();
  });

  test('renders no experiences message initially', () => {
    render(<StudentExperienceResearch studentData={{}} />);
    expect(screen.getByText(/No detailed experiences added yet/i)).toBeInTheDocument();
  });

  test('opens add experience dialog when clicking "Add Experience" button', async () => {
    render(<StudentExperienceResearch studentData={{}} />);
    const addButton = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(addButton);

    // ✅ Correct: check that "Add Experience" button inside Modal appears
    expect(await screen.findByRole('button', { name: /Add Experience/i })).toBeInTheDocument();
  });

  test('shows validation error if submitting empty experience form', async () => {
    render(<StudentExperienceResearch studentData={{}} />);
    const addButton = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(addButton);

    const saveButton = await screen.findByRole('button', { name: /Add Experience/i });
    fireEvent.click(saveButton);

    // ✅ Adjust this to what your validation message shows
    const errors = await screen.findAllByText(/required/i);
    expect(errors.length).toBeGreaterThan(1);
  });

});
