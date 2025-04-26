import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';
import '@testing-library/jest-dom';

// ✅ Mock firebase modules
jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'mockUserId' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(),
  orderBy: jest.fn(() => ({})),
  onSnapshot: jest.fn((q, callback) => {
    callback({
      docs: [],
    });
    return jest.fn(); // unsubscribe
  }),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: 'mockUserId' });
    return jest.fn(); // unsubscribe
  },
}));

describe('StudentCoursesEnrolled Component', () => {
  test('renders "My Courses Enrolled" title', () => {
    render(<StudentCoursesEnrolled studentData={{}} />);
    expect(screen.getByText(/My Courses Enrolled/i)).toBeInTheDocument();
  });

  test('renders no courses message initially', () => {
    render(<StudentCoursesEnrolled studentData={{}} />);
    expect(screen.getByText(/You haven't added any courses yet/i)).toBeInTheDocument();
  });

  test('opens add course dialog when clicking "Add Course" button', () => {
    render(<StudentCoursesEnrolled studentData={{}} />);
    const addButton = screen.getByRole('button', { name: /Add Course/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Add Enrolled Course/i)).toBeInTheDocument();
  });

  test('shows validation error if submitting empty form', async () => {
    render(<StudentCoursesEnrolled studentData={{}} />);
    const addButton = screen.getByRole('button', { name: /Add Course/i });
    fireEvent.click(addButton);

    const saveButton = screen.getByRole('button', { name: /Add Course/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Course Code\/Name and Semester are required/i)).toBeInTheDocument();
  });

  test('submits course successfully', async () => {
    render(<StudentCoursesEnrolled studentData={{}} />);
    const addButton = screen.getByRole('button', { name: /Add Course/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/Course Code \/ Name/i), { target: { value: 'CS101' } });
    fireEvent.change(screen.getByLabelText(/Semester Taken/i), { target: { value: 'Fall 2024' } });

    const saveButton = screen.getByRole('button', { name: /Add Course/i });
    fireEvent.click(saveButton);

    // ✅ Corrected wait
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
