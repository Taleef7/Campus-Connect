import '@testing-library/jest-dom'; // <-- ADD THIS LINE
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import FileUploadField from '../components/common/FileUploadField';

describe('FileUploadField Component', () => {
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const defaultProps = {
    label: 'Resume',
    fileLink: 'https://example.com/resume.pdf',
    accept: 'application/pdf',
    onSave: mockOnSave,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in display mode with file link', () => {
    render(<FileUploadField {...defaultProps} />);
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view file/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Edit Resume')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Resume')).toBeInTheDocument();
  });

  it('enters edit mode when Edit button is clicked', () => {
    render(<FileUploadField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Edit Resume'));
    expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument();
  });

  it('calls onSave with selected file when Save button is clicked', async () => {
    render(<FileUploadField {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Edit Resume'));

    const fileInput = screen.getByRole('button', { name: /select file/i }).querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(expect.any(File));
    });
  });

  it('calls onDelete when Delete button is clicked and confirmed', async () => {
    window.confirm = jest.fn(() => true);

    render(<FileUploadField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Delete Resume'));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    window.confirm.mockRestore?.();
  });
});
