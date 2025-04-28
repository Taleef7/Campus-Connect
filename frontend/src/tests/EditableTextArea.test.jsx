import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditableTextArea from '../components/common/EditableTextArea';

describe('EditableTextArea Component', () => {
  const mockOnSave = jest.fn();

  const defaultProps = {
    label: 'Bio',
    value: 'This is my bio.',
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and value correctly in display mode', () => {
    render(<EditableTextArea {...defaultProps} />);

    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('This is my bio.')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument(); // Edit button exists
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<EditableTextArea {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByLabelText('Bio')).toBeInTheDocument(); // TextArea appears
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onSave with trimmed input when save button is clicked', async () => {
    render(<EditableTextArea {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByLabelText('Bio');
    fireEvent.change(input, { target: { value: '  Updated bio text  ' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('Updated bio text'); // Should be trimmed
  });

  it('cancels edit when cancel button is clicked', () => {
    render(<EditableTextArea {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByLabelText('Bio');
    fireEvent.change(input, { target: { value: 'Another change' } });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Should return to original value
    expect(screen.getByText('This is my bio.')).toBeInTheDocument();
  });

  it('shows placeholder text when value is empty', () => {
    render(
      <EditableTextArea
        {...defaultProps}
        value=""
        placeholder="(No bio provided)"
      />
    );

    expect(screen.getByText('(No bio provided)')).toBeInTheDocument();
  });
});
