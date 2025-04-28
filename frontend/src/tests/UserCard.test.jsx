// src/tests/UserCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { MemoryRouter } from 'react-router-dom'; 
import UserCard from '../components/directory/UserCard';

describe('UserCard Component', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    photoLink: '',
    role: 'student',
    major: 'Computer Science',
    year: 'Senior',
    department: '',
    interests: ['AI', 'Web Development'],
    experienceTags: ['React', 'Node.js', 'GraphQL'],
  };

  it('renders user name and major/year info', () => {
    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Computer Science - Senior')).toBeInTheDocument();
  });

  it('displays role chip correctly', () => {
    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('renders experience tags', () => {
    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('GraphQL')).toBeInTheDocument();
  });

  it('renders interests', () => {
    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );
    expect(screen.getByText(/AI, Web Development/i)).toBeInTheDocument();
  });

  it('renders "View Profile" link', () => {
    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /view profile/i })).toBeInTheDocument();
  });
});
