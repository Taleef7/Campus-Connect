import '@testing-library/jest-dom'; // Important: Must import for custom matchers like toBeInTheDocument()
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

describe('ConfirmationDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    message: 'Test message for confirmation.',
    confirmText: 'Yes',
    cancelText: 'No',
    isProcessing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it('renders title, message, and buttons correctly', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message for confirmation.')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Yes');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    const cancelButton = screen.getByText('No');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isProcessing is true', () => {
    render(<ConfirmationDialog {...defaultProps} isProcessing={true} />);

    expect(screen.getByText('Processing...')).toBeDisabled();
    expect(screen.getByText('No')).toBeDisabled();
  });
});
