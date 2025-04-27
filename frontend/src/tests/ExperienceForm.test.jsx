import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExperienceForm from '../components/profile/ExperienceForm';
import '@testing-library/jest-dom';

describe('ExperienceForm Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(() => Promise.resolve()),
    userId: '12345',
    isSaving: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders in Add Mode', () => {
    render(<ExperienceForm {...defaultProps} />);
    expect(screen.getByText(/Add New Experience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Experience/i })).toBeInTheDocument();
  });

  test('renders in Edit Mode with initial data', () => {
    render(
      <ExperienceForm
        {...defaultProps}
        initialData={{
          title: 'Intern',
          organization: 'Google',
          startDate: '2023-01',
          endDate: '2023-06',
          isCurrent: false,
          type: 'work',
        }}
      />
    );
    expect(screen.getByDisplayValue('Intern')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Google')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Experience/i })).toBeInTheDocument();
  });

  test('disables end date field when isCurrent is checked', () => {
    render(<ExperienceForm {...defaultProps} />);
    const checkbox = screen.getByLabelText(/currently working/i);
    fireEvent.click(checkbox);
    const endDateField = screen.getByLabelText(/End Date/i);
    expect(endDateField).toBeDisabled();
  });

  test('shows validation errors for required fields', async () => {
    render(<ExperienceForm {...defaultProps} />);
    const saveBtn = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Organization.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Date is required/i)).toBeInTheDocument();
    });
  });

  test('calls onSave with expected data on valid submission', async () => {
    render(<ExperienceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Research Assistant' },
    });

    fireEvent.change(screen.getByLabelText(/Organization/i), {
      target: { value: 'MIT' },
    });

    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: '2023-01' },
    });

    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: '2023-06' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Experience/i }));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  test('shows error for invalid link', async () => {
    render(<ExperienceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Engineer' },
    });
    fireEvent.change(screen.getByLabelText(/Organization/i), {
      target: { value: 'OpenAI' },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: '2022-10' },
    });
    fireEvent.change(screen.getByLabelText(/Link/i), {
      target: { value: 'not-a-url' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Experience/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid URL/i)).toBeInTheDocument();
    });
  });
});
