/// <reference types="cypress" />

context('Build Standard template with deep routes and content (examples/minimal)', () => {
  beforeEach(() => {
    cy.visit('/minimal/dist')
  })

  it('should render executed JavaScript even without content', () => {
    cy.get('[data-cy="add-value"]')
      .should('contain', '13')
  })

})
