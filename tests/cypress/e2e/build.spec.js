/// <reference types="cypress" />

context('Build Standard template with deep routes and content', () => {
  beforeEach(() => {
    cy.visit('/standard/dist')
  })

  it('should render executed JavaScript', () => {
    cy.get('[data-cy="js-in-abell-test"]')
      .should('contain', '11')
  })

  it('should render required text from JSON', () => {
    cy.get('[data-cy="include-from-json-test"]')
      .should('contain', 'hi I am from JSON')
  })

  it('should render value from abell.config.js globalMeta', () => {
    cy.get('[data-cy="globalmeta-test"]')
      .should('contain', 'Abell Demo')
  })

  it('should render nothing since the file is at top level', () => {
    cy.get('[data-cy="root-test"]')
      .should('contain', '')
  })

  it('should render information of all the content from $contentArray', () => {
    const contentMetaEls = cy.get('[data-cy="contentarray-container"]').children();
    contentMetaEls.should('have.length', 4);
  })
})
