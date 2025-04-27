// src/tests/StudentCoursesEnrolled.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';
import '@testing-library/jest-dom';

// Mock MUI Dialog Portal rendering
jest.mock('@mui/material', () => {
  const actualMui = jest.requireActual('@mui/material');
  return {
    ...actualMui,
    Dialog: (props) => <div>{props.children}</div>,
    DialogContent: (props) => <div>{props.children}</div>,
    DialogTitle: (props) => <div>{props.children}</div>,
    DialogActions: (props) => <div>{props.children}</div>,
  };
});

// Mock Firebase hooks (to avoid real DB calls)
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

describe('StudentCoursesEnrolled Component', () => {
  const mockStudentData = {
    name: 'John Doe',
  };

  test('renders "My Courses" title and Add Course button', () => {
    render(<StudentCoursesEnrolled studentData={mockStudentData} />);

    expect(screen.getByText('My Courses')).toBeInTheDocument();
    expect(screen.getByTestId('add-course-page-button')).toBeInTheDocument();

  });

  test('opens the add course form when clicking "Add Course"', () => {
    render(<StudentCoursesEnrolled studentData={mockStudentData} />);

    fireEvent.click(screen.getByTestId('add-course-page-button'));


    expect(screen.getByLabelText(/Course Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Semester Taken/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructor Name/i)).toBeInTheDocument();
  });

  test('shows error when trying to save without required fields', async () => {
    render(<StudentCoursesEnrolled studentData={mockStudentData} />);

    fireEvent.click(screen.getByTestId('add-course-page-button')); // open dialog
  fireEvent.click(screen.getByTestId('submit-course-button'));

    await waitFor(() => {
      expect(screen.getByText(/Course Code\/Name and Semester are required/i)).toBeInTheDocument();
    });
  });

  test('displays no courses message when no courses enrolled', () => {
    render(<StudentCoursesEnrolled studentData={mockStudentData} />);

    expect(screen.getByText(/You haven't added any courses yet/i)).toBeInTheDocument();
  });
});
