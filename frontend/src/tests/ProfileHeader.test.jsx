import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileHeader from '../components/profile/ProfileHeader';
import '@testing-library/jest-dom';

describe('ProfileHeader Component', () => {
  const defaultProps = {
    coverLink: 'https://example.com/cover.jpg',
    photoLink: 'https://example.com/photo.jpg',
    professorName: 'John Doe',
    onEditCover: jest.fn(),
    onViewCover: jest.fn(),
    onEditPhoto: jest.fn(),
    onViewPhoto: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders avatar with image', () => {
    render(<ProfileHeader {...defaultProps} />);
    const avatar = screen.getByAltText(/john doe/i);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', defaultProps.photoLink);
  });

  test('renders initials when photo is missing', () => {
    render(<ProfileHeader {...defaultProps} photoLink="" />);
    const initials = screen.getByText('JD');
    expect(initials).toBeInTheDocument();
  });

  test('calls onViewCover when cover is clicked and cover exists', () => {
    render(<ProfileHeader {...defaultProps} />);
    const cover = screen.getByLabelText('Edit cover photo').parentElement; // parent Box
    fireEvent.click(cover);
    expect(defaultProps.onViewCover).toHaveBeenCalled();
  });

  test('calls onEditCover when cover is clicked and no cover exists', () => {
    render(<ProfileHeader {...defaultProps} coverLink="" />);
    const cover = screen.getByLabelText('Edit cover photo').parentElement;
    fireEvent.click(cover);
    expect(defaultProps.onEditCover).toHaveBeenCalled();
  });

  test('calls onViewPhoto when avatar clicked and photo exists', () => {
    render(<ProfileHeader {...defaultProps} />);
    const avatar = screen.getByAltText(/john doe/i).parentElement;
    fireEvent.click(avatar);
    expect(defaultProps.onViewPhoto).toHaveBeenCalled();
  });

  test('calls onEditPhoto when avatar clicked and no photo exists', () => {
    render(<ProfileHeader {...defaultProps} photoLink="" />);
    const avatar = screen.getByText('JD').parentElement;
    fireEvent.click(avatar);
    expect(defaultProps.onEditPhoto).toHaveBeenCalled();
  });

  test('clicking Edit Cover button calls onEditCover', () => {
    render(<ProfileHeader {...defaultProps} />);
    const editCoverButton = screen.getByLabelText('Edit cover photo');
    fireEvent.click(editCoverButton);
    expect(defaultProps.onEditCover).toHaveBeenCalled();
  });

  test('clicking Edit Photo button calls onEditPhoto', () => {
    render(<ProfileHeader {...defaultProps} />);
    const editPhotoButton = screen.getByLabelText('Edit profile photo');
    fireEvent.click(editPhotoButton);
    expect(defaultProps.onEditPhoto).toHaveBeenCalled();
  });
});
