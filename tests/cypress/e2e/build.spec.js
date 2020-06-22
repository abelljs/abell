/// <reference types="cypress" />

context('Check DOM Elements', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5000')
  })

  // The most commonly used query is 'cy.get()', you can
  // think of this like the '$' in jQuery

  it('cy.get() - query DOM elements', () => {
    cy.get('header').should('contain', 'Addition of numbers: 11')
  })
})
