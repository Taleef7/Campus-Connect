import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterControls from '../components/directory/FilterControls'; // make sure path is correct

describe('FilterControls Component', () => {
  const mockOnRoleChange = jest.fn();
  const mockOnDepartmentChange = jest.fn();
  const mockOnMajorChange = jest.fn();
  const mockOnYearChange = jest.fn();

  const departmentsList = ['Mathematics', 'Physics'];
  const majorsList = ['Software Engineering', 'Computer Science'];
  const yearsList = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

  beforeEach(() => {
    render(
      <FilterControls
        selectedRole=""
        selectedDepartment=""
        selectedMajor=""
        selectedYear=""
        onRoleChange={mockOnRoleChange}
        onDepartmentChange={mockOnDepartmentChange}
        onMajorChange={mockOnMajorChange}
        onYearChange={mockOnYearChange}
        departmentsList={departmentsList}
        majorsList={majorsList}
        yearsList={yearsList}
      />
    );
  });

  it('calls correct handler when role changes', async () => {
    const roleSelect = screen.getByLabelText('Role');
    await userEvent.click(roleSelect);

    const studentOption = await screen.findByText('Student');
    await userEvent.click(studentOption);

    expect(mockOnRoleChange).toHaveBeenCalledTimes(1);
  });

  it('calls correct handler when major changes', async () => {
    const majorSelect = screen.getByLabelText('Major');
    await userEvent.click(majorSelect);

    const majorOption = await screen.findByText('Software Engineering');
    await userEvent.click(majorOption);

    expect(mockOnMajorChange).toHaveBeenCalledTimes(1);
  });

  it('calls correct handler when year changes', async () => {
    const yearSelect = screen.getByLabelText('Year');
    await userEvent.click(yearSelect);

    const yearOption = await screen.findByText('Junior');
    await userEvent.click(yearOption);

    expect(mockOnYearChange).toHaveBeenCalledTimes(1);
  });

  it('calls correct handler when department changes', async () => {
    const deptSelect = screen.getByLabelText('Department');
    await userEvent.click(deptSelect);

    const deptOption = await screen.findByText('Mathematics');
    await userEvent.click(deptOption);

    expect(mockOnDepartmentChange).toHaveBeenCalledTimes(1);
  });
});