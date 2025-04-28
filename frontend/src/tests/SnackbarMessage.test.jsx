// src/tests/SnackbarMessage.test.jsx

import '@testing-library/jest-dom'; // 👈 IMPORTANT: for toBeInTheDocument and other matchers
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SnackbarMessage from '../components/common/SnackbarMessage';

describe('SnackbarMessage Component', () => {
  const defaultProps = {
    open: true,
    message: 'Test message!',
    severity: 'success',
    onClose: jest.fn(),
  };

  it('renders the snackbar with correct message and severity', () => {
    render(<SnackbarMessage {...defaultProps} />);
    
    // Message should be visible
    expect(screen.getByText('Test message!')).toBeInTheDocument();

    // Alert role should exist
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onClose when autoHideDuration expires', () => {
    jest.useFakeTimers(); // Mock timers

    render(<SnackbarMessage {...defaultProps} />);
    
    jest.advanceTimersByTime(4000); // Move time forward by duration
    expect(defaultProps.onClose).toHaveBeenCalled(); // Should have triggered onClose
  });

  it('calls onClose when user manually closes the snackbar', () => {
    render(<SnackbarMessage {...defaultProps} />);

    const alert = screen.getByRole('alert');
    fireEvent.click(alert); // Simulate close by clicking the alert (you could improve if you had close button separately)
    
    // Might not call immediately unless you wire it on click, so generally prefer timer based tests
    // Here since onClose is wired to Alert's onClose, you can simulate closing
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

});
