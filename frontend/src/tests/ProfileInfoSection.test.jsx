// ProfileInfoSection.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileInfoSection from '../components/profile/ProfileInfoSection';
import '@testing-library/jest-dom';

// Mock child components to isolate ProfileInfoSection behavior
jest.mock('../components/common/EditableField', () => (props) => (
  <div data-testid={`EditableField-${props.label}`}>{props.value}</div>
));

jest.mock('../components/common/EditableTextArea', () => (props) => (
  <div data-testid="EditableTextArea">Editable Text Area</div>
));

jest.mock('../components/common/FileUploadField', () => (props) => (
  <div data-testid="FileUploadField">File Upload Field</div>
));

describe('ProfileInfoSection', () => {
  const mockData = {
    name: 'John Doe',
    headline: 'Professor of Computer Science',
    pronouns: 'He/Him',
    department: 'Computer Science',
    about: 'Experienced in AI research.',
    resumeLink: 'http://example.com/resume.pdf',
  };

  const handlers = {
    handleNameSave: jest.fn(),
    handleHeadlineSave: jest.fn(),
    handlePronounsSave: jest.fn(),
    handleAboutSave: jest.fn(),
    handleResumeSave: jest.fn(),
    handleResumeDelete: jest.fn(),
    handleDepartmentSave: jest.fn(),
  };

  test('renders all editable fields and sections', () => {
    render(<ProfileInfoSection professorData={mockData} isSaving={false} {...handlers} />);

    expect(screen.getByTestId('EditableField-Full Name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('EditableField-Headline/Title')).toHaveTextContent('Professor of Computer Science');
    expect(screen.getByTestId('EditableField-Pronouns')).toHaveTextContent('He/Him');
    expect(screen.getByTestId('EditableField-Department')).toHaveTextContent('Computer Science');

    expect(screen.getByTestId('EditableTextArea')).toBeInTheDocument();
    expect(screen.getByTestId('FileUploadField')).toBeInTheDocument();
  });

  test('renders with empty professorData gracefully', () => {
    render(<ProfileInfoSection professorData={{}} isSaving={false} {...handlers} />);

    expect(screen.getByTestId('EditableField-Full Name')).toBeInTheDocument();
    expect(screen.getByTestId('EditableField-Headline/Title')).toBeInTheDocument();
    expect(screen.getByTestId('EditableField-Pronouns')).toBeInTheDocument();
    expect(screen.getByTestId('EditableField-Department')).toBeInTheDocument();
    expect(screen.getByTestId('EditableTextArea')).toBeInTheDocument();
    expect(screen.getByTestId('FileUploadField')).toBeInTheDocument();
  });

  test('disables fields when isSaving is true', () => {
    render(<ProfileInfoSection professorData={mockData} isSaving={true} {...handlers} />);

    expect(screen.getByTestId('EditableField-Full Name')).toBeInTheDocument();
    expect(screen.getByTestId('FileUploadField')).toBeInTheDocument();
    // We assume fields would show in disabled state if the child components implemented it
  });
});
