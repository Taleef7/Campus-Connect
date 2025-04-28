import '@testing-library/jest-dom'; // Required for .toBeInTheDocument
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditableField from '../components/common/EditableField';

describe('EditableField Component', () => {
  const mockOnSave = jest.fn();

  const defaultProps = {
    label: 'Name',
    value: 'John Doe',
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and value correctly in display mode', () => {
    render(<EditableField {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument(); // Label
    expect(screen.getByText('John Doe')).toBeInTheDocument(); // Value
    expect(screen.getByLabelText('Edit Name')).toBeInTheDocument(); // Edit button
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<EditableField {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Edit Name'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument(); // TextField appears
    expect(screen.getByLabelText('Save Name')).toBeInTheDocument(); // Save button
    expect(screen.getByLabelText('Cancel Name edit')).toBeInTheDocument(); // Cancel button
  });

  it('calls onSave with trimmed input when save button is clicked', async () => {
    render(<EditableField {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Edit Name'));

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: '  Jane Doe  ' } }); // Enter new value with spaces

    fireEvent.click(screen.getByLabelText('Save Name'));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('Jane Doe'); // Trimmed value
  });

  it('cancels edit when cancel button is clicked', () => {
    render(<EditableField {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Edit Name'));

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Something New' } });

    fireEvent.click(screen.getByLabelText('Cancel Name edit'));

    // Back to display mode with original value
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows placeholder text when value is empty', () => {
    render(
      <EditableField
        {...defaultProps}
        value=""
        emptyText="(No Name Provided)"
      />
    );

    expect(screen.getByText('(No Name Provided)')).toBeInTheDocument();
  });
});
