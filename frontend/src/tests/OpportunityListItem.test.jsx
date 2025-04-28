// frontend/src/tests/OpportunityListItem.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { Timestamp } from 'firebase/firestore';
import OpportunityListItem from '../components/opportunities/OpportunityListItem';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockOpportunity = {
  id: 'oppo123',
  title: 'Research Internship',
  description: 'Join an AI research team working on NLP models.',
  type: 'Internship',
  allowInterest: true,
  createdAt: Timestamp.now(),
  deadline: Timestamp.now(),
  professorName: 'Dr. Smith',
};

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('OpportunityListItem Component', () => {
  it('renders title and description', () => {
    renderWithTheme(<OpportunityListItem opportunity={mockOpportunity} viewMode="professor" />);
    expect(screen.getByText('Research Internship')).toBeInTheDocument();
    expect(screen.getByText(/Join an AI research team/i)).toBeInTheDocument();
  });

  it('renders "View Interested" button in professor view', () => {
    const handleViewInterested = jest.fn();
    renderWithTheme(
      <OpportunityListItem
        opportunity={mockOpportunity}
        viewMode="professor"
        onViewInterested={handleViewInterested}
      />
    );
    expect(screen.getByRole('button', { name: /view interested/i })).toBeInTheDocument();
  });

  it('renders "Mark Interest" button for student', () => {
    renderWithTheme(
      <OpportunityListItem
        opportunity={mockOpportunity}
        viewMode="student"
        isAlreadyInterested={false}
      />
    );
    expect(screen.getByRole('button', { name: /mark interest/i })).toBeInTheDocument();
  });

  it('calls onMarkInterest when "Mark Interest" is clicked', () => {
    const handleMarkInterest = jest.fn();
    renderWithTheme(
      <OpportunityListItem
        opportunity={mockOpportunity}
        viewMode="student"
        onMarkInterest={handleMarkInterest}
        isAlreadyInterested={false}
      />
    );
    const button = screen.getByRole('button', { name: /mark interest/i });
    fireEvent.click(button);
    expect(handleMarkInterest).toHaveBeenCalled();
  });

  it('renders "Remove Interest" button if already interested', () => {
    renderWithTheme(
      <OpportunityListItem
        opportunity={mockOpportunity}
        viewMode="student"
        isAlreadyInterested={true}
      />
    );
    expect(screen.getByRole('button', { name: /remove interest/i })).toBeInTheDocument();
  });

  it('shows deadline and posted dates', () => {
    renderWithTheme(<OpportunityListItem opportunity={mockOpportunity} viewMode="student" />);
    expect(screen.getByText(/posted/i)).toBeInTheDocument();
    expect(screen.getByText(/deadline/i)).toBeInTheDocument();
  });

  it('renders "Interest Enabled" chip for professor if allowInterest is true', () => {
    renderWithTheme(<OpportunityListItem opportunity={mockOpportunity} viewMode="professor" />);
    expect(screen.getByText(/interest enabled/i)).toBeInTheDocument();
  });

  it('shows "Deadline Passed" chip if deadline is passed', () => {
    const pastOpportunity = {
      ...mockOpportunity,
      deadline: Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
    };
    renderWithTheme(
      <OpportunityListItem
        opportunity={pastOpportunity}
        viewMode="student"
        deadlinePassed={true}
      />
    );
    expect(screen.getByText(/deadline passed/i)).toBeInTheDocument();
  });
});
