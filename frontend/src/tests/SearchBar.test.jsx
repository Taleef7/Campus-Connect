// src/tests/SearchBar.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';  // <-- 👈 Add this line
import SearchBar from '../components/directory/SearchBar';

describe('SearchBar Component', () => {
  it('renders correctly with placeholder text', () => {
    render(<SearchBar searchTerm="" onSearchChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search by name, major, department, interests/i);
    expect(input).toBeInTheDocument();
  });

  it('displays the value from props', () => {
    render(<SearchBar searchTerm="Test User" onSearchChange={() => {}} />);
    const input = screen.getByDisplayValue('Test User');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    const mockOnChange = jest.fn();
    render(<SearchBar searchTerm="" onSearchChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search by name, major, department, interests/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
