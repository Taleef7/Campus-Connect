import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileHeader from '../components/profile/ProfileHeader';
import '@testing-library/jest-dom';

test('clicking avatar without photo calls onEditPhoto', () => {
  const mockOnEditPhoto = jest.fn();

  render(
    <ProfileHeader
      professorName="John Doe"
      onEditPhoto={mockOnEditPhoto}
      onViewPhoto={jest.fn()}
      onEditCover={jest.fn()}
      onViewCover={jest.fn()}
    />
  );

  const avatar = screen.getByText('JD'); // 👉 Select by initials instead of img role
  fireEvent.click(avatar);

  expect(mockOnEditPhoto).toHaveBeenCalled();
});
