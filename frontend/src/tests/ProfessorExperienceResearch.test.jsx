import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProfessorExperienceResearch from '../components/profile/ProfessorExperienceResearch';
import '@testing-library/jest-dom';

// ✅ Mocks for Firebase
jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'mockUserId' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn((_, successCb) => {
    successCb({ docs: [] }); // mock empty experience list
    return jest.fn(); // unsubscribe function
  }),
}));

describe('ProfessorExperienceResearch', () => {
  const mockProfessorData = {
    experienceTags: ['AI', 'ML', 'React'],
  };

  test('renders tags and "Add Experience" button', () => {
    render(<ProfessorExperienceResearch professorData={mockProfessorData} />);
    expect(screen.getByText(/My Experience & Research Areas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Experience/i })).toBeInTheDocument();
    expect(screen.getByText(/AI/)).toBeInTheDocument();
    expect(screen.getByText(/ML/)).toBeInTheDocument();
    expect(screen.getByText(/React/)).toBeInTheDocument();
  });

  test('adds a tag successfully', async () => {
    render(<ProfessorExperienceResearch professorData={mockProfessorData} />);
    
    const input = screen.getByLabelText(/Add New Tag/i);
    fireEvent.change(input, { target: { value: 'Testing' } });

    // ⬇️ Corrected here:
    const form = input.closest('form');
    expect(form).toBeInTheDocument(); // (optional, sanity check)

    const addButton = within(form).getByRole('button', { name: /Add/i });
    
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/added successfully/i)).toBeInTheDocument();
    });
  });

  test('opens ExperienceForm modal', () => {
    render(<ProfessorExperienceResearch professorData={mockProfessorData} />);
    const openBtn = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(openBtn);
    expect(screen.getByText(/Add New Experience/i)).toBeInTheDocument();
  });
});
