// frontend/tests/e2e/courses.cy.js
// FINAL VERSION (Based on your input and successful runs)

describe('Professor Dashboard - Course Management', () => {
    beforeEach(() => {
      cy.login('professor');
      cy.get('[data-testid="prof-tab-courses"]', { timeout: 15000 })
        .should('be.visible')
        .click();
      cy.get('[data-testid="add-course-button"]', { timeout: 10000 }).should('be.visible');
    });
  
    it('should allow adding a new course', () => {
      const courseName = `Test Cypress Course ${Date.now()}`;
      const courseDesc = 'This is a test course created by Cypress.';
      const courseLink = 'https://example.com/cypress-course';
  
      cy.get('[data-testid="add-course-button"]').click();
      cy.get('[data-testid="course-form-dialog"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="course-form-dialog"]').find('input[name="courseName"]').type(courseName);
      // Using the selector confirmed to work for the user:
      cy.get('[data-testid="course-description-input"]').find('input[name="description"]').type(courseDesc);
      cy.get('[data-testid="course-form-dialog"]').find('input[name="link"]').type(courseLink);
      cy.get('[data-testid="course-status-select"]').click();
      cy.get('ul[role="listbox"]').contains('li', 'Ongoing').click();
      cy.get('[data-testid="course-form-save-button"]').click();
  
      cy.get('[data-testid="course-form-dialog"]').should('not.exist');
      cy.get('[data-testid="course-list-container"]', { timeout: 10000 })
        .contains('[data-testid^="course-item-name-"]', courseName)
        .should('be.visible');
  
      // Cleanup
      cy.contains('[data-testid^="course-list-item-"]', courseName)
        .find('[data-testid^="course-item-delete-button-"]')
        .click();
      cy.on('window:confirm', () => true);
      cy.contains('[data-testid^="course-item-name-"]', courseName).should('not.exist');
    });
  
    it('should display existing courses correctly', () => {
      const existingCourseName = `Test Display Course ${Date.now()}`;
      const existingCourseDesc = 'Description for display test.';
      const existingCourseLink = 'https://example.com/display-test';
      const existingCourseStatus = 'Completed';
  
      // Add course
      cy.get('[data-testid="add-course-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('be.visible');
      cy.get('[data-testid="course-form-dialog"]').find('input[name="courseName"]').type(existingCourseName);
      cy.get('[data-testid="course-description-input"]').find('input[name="description"]').type(existingCourseDesc); // Your working selector
      cy.get('[data-testid="course-form-dialog"]').find('input[name="link"]').type(existingCourseLink);
      cy.get('[data-testid="course-status-select"]').click();
      cy.get('ul[role="listbox"]').contains('li', existingCourseStatus).click();
      cy.get('[data-testid="course-form-save-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('not.exist');
      cy.get('[data-testid="course-list-container"]').contains(existingCourseName).should('be.visible');
  
      cy.log('Reloading page to check existing course display');
      cy.reload();
      cy.log('Page reloaded, clicking Courses tab and waiting for course...');
  
      // Click tab again after reload (User's fix)
      cy.get('[data-testid="prof-tab-courses"]', { timeout: 15000 })
       .should('be.visible')
       .click();
  
      // Assert after reload + tab click
      cy.contains('[data-testid^="course-list-item-"]', existingCourseName, { timeout: 15000 })
        .should('be.visible')
        .within(() => {
            cy.get('[data-testid^="course-item-name-"]').should('contain', existingCourseName);
            cy.get('[data-testid^="course-item-desc-"]').should('contain', existingCourseDesc);
            cy.get('.MuiChip-label').should('contain', existingCourseStatus);
            cy.get('a').contains('Go to Course').should('have.attr', 'href', existingCourseLink);
        });
  
      // Cleanup
      cy.log('Course found after reload, starting cleanup...');
      cy.contains('[data-testid^="course-list-item-"]', existingCourseName)
        .find('[data-testid^="course-item-delete-button-"]')
        .click();
      cy.on('window:confirm', () => true);
      cy.contains('[data-testid^="course-item-name-"]', existingCourseName).should('not.exist');
    });
  
    it('should allow editing an existing course', () => {
      const initialCourseName = `Test Edit Course ${Date.now()}`;
      const initialCourseDesc = 'Initial description.';
      const initialCourseLink = 'https://example.com/initial';
      const editedCourseDesc = 'UPDATED course description.';
      const editedCourseStatus = 'Completed';
  
      // Add course
      cy.get('[data-testid="add-course-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('be.visible');
      cy.get('[data-testid="course-form-dialog"]').find('input[name="courseName"]').type(initialCourseName);
      cy.get('[data-testid="course-description-input"]').find('input[name="description"]').type(initialCourseDesc); // Your working selector
      cy.get('[data-testid="course-form-dialog"]').find('input[name="link"]').type(initialCourseLink);
      cy.get('[data-testid="course-status-select"]').click();
      cy.get('ul[role="listbox"]').contains('li', 'Ongoing').click();
      cy.get('[data-testid="course-form-save-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('not.exist');
  
      // Edit the course
      cy.contains('[data-testid^="course-list-item-"]', initialCourseName)
        .find('[data-testid^="course-item-edit-button-"]')
        .click();
      cy.get('[data-testid="course-form-dialog"]').should('be.visible');
      cy.get('[data-testid="course-form-dialog"]').contains('Edit Course').should('be.visible');
      cy.get('[data-testid="course-description-input"]').find('input[name="description"]') // Your working selector
          .clear()
          .type(editedCourseDesc);
      cy.get('[data-testid="course-status-select"]').click();
      cy.get('ul[role="listbox"]').contains('li', editedCourseStatus).click();
      cy.get('[data-testid="course-form-save-button"]').click();
  
      // Assert changes
      cy.get('[data-testid="course-form-dialog"]').should('not.exist');
      cy.contains('[data-testid^="course-list-item-"]', initialCourseName)
        .should('contain', editedCourseDesc)
        .find('.MuiChip-label')
        .should('contain', editedCourseStatus);
  
      // Cleanup
      cy.contains('[data-testid^="course-list-item-"]', initialCourseName)
        .find('[data-testid^="course-item-delete-button-"]')
        .click();
      cy.on('window:confirm', () => true);
      cy.contains('[data-testid^="course-item-name-"]', initialCourseName).should('not.exist');
    });
  
    it('should allow deleting a course', () => {
      const courseNameToDelete = `Test Delete Course ${Date.now()}`;
      const courseDesc = 'This course will be deleted.';
      const courseLink = 'https://example.com/delete-me';
  
      // Add course
      cy.get('[data-testid="add-course-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('be.visible');
      cy.get('[data-testid="course-form-dialog"]').find('input[name="courseName"]').type(courseNameToDelete);
      cy.get('[data-testid="course-description-input"]').find('input[name="description"]').type(courseDesc); // Your selector
      cy.get('[data-testid="course-form-dialog"]').find('input[name="link"]').type(courseLink);
      cy.get('[data-testid="course-status-select"]').click();
      cy.get('ul[role="listbox"]').contains('li', 'Ongoing').click();
      cy.get('[data-testid="course-form-save-button"]').click();
      cy.get('[data-testid="course-form-dialog"]').should('not.exist');
      cy.get('[data-testid="course-list-container"]', { timeout: 10000 })
          .contains('[data-testid^="course-item-name-"]', courseNameToDelete)
          .should('be.visible');
  
      // Delete the course
      cy.contains('[data-testid^="course-list-item-"]', courseNameToDelete)
        .find('[data-testid^="course-item-delete-button-"]')
        .click();
      cy.on('window:confirm', () => true); // Assumes default browser confirm
  
      // Assert deletion
      cy.get('[data-testid="course-list-container"]')
          .contains(courseNameToDelete)
          .should('not.exist');
    });
  
  });