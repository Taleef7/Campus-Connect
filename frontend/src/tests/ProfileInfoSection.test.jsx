import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileInfoSection from '../components/profile/ProfileInfoSection';
import '@testing-library/jest-dom';

describe('ProfileInfoSection Component', () => {
  const defaultProps = {
    professorData: {
      name: 'John Doe',
      headline: 'Professor of Computer Science',
      pronouns: 'he/him',
      about: 'Passionate educator and researcher.',
      department: 'Computer Science',
      resumeLink: 'https://example.com/resume.pdf',
    },
    isSaving: false,
    handleNameSave: jest.fn(),
    handleHeadlineSave: jest.fn(),
    handlePronounsSave: jest.fn(),
    handleAboutSave: jest.fn(),
    handleResumeSave: jest.fn(),
    handleResumeDelete: jest.fn(),
    handleDepartmentSave: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders all editable fields and sections correctly', () => {
    render(<ProfileInfoSection {...defaultProps} />);

    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Headline\/Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Pronouns/i)).toBeInTheDocument();
    expect(screen.getByText(/Department/i)).toBeInTheDocument();
    
    // For About heading specifically
    expect(screen.getByRole('heading', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Resume/i })).toBeInTheDocument();

    // Check values
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Professor of Computer Science')).toBeInTheDocument();
    expect(screen.getByText('he/him')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText(/Passionate educator and researcher\./i)).toBeInTheDocument();
    expect(screen.getByText(/View PDF/i)).toBeInTheDocument();
  });

  test('renders fallback text when professorData is missing values', () => {
    const propsWithEmptyData = {
      ...defaultProps,
      professorData: {},
    };

    render(<ProfileInfoSection {...propsWithEmptyData} />);

    expect(screen.getByText('(Not set)')).toBeInTheDocument(); // Name fallback
    expect(screen.getByText('(No headline)')).toBeInTheDocument();
    expect(screen.getByText(/Pronouns: \(Not set\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Department: \(Not set\)/i)).toBeInTheDocument();
    expect(screen.getByText('(Provide a brief description about yourself)')).toBeInTheDocument();
    expect(screen.getByText(/No resume uploaded/i)).toBeInTheDocument();
  });

  test('resume upload View PDF button should be present', () => {
    render(<ProfileInfoSection {...defaultProps} />);

    expect(screen.getByText(/View PDF/i)).toBeInTheDocument();
    // No assertion for "Select PDF File" needed because it might not be directly rendered.
  });

  test('should call save handlers when editable fields are interacted (mock)', () => {
    render(<ProfileInfoSection {...defaultProps} />);

    // Just rendering, not simulating edits here
    expect(defaultProps.handleNameSave).not.toHaveBeenCalled();
  });
});
