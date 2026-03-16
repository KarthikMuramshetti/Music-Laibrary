describe('Admin features', () => {

  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@musiclibrary.com')
    cy.get('input[type="password"]').type('Admin@1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/library')
  })

  it('admin sees admin menu in sidebar', () => {
    cy.contains('Manage Songs').should('be.visible')
    cy.contains('Artists').should('be.visible')
    cy.contains('Directors').should('be.visible')
    cy.contains('Albums').should('be.visible')
  })

  it('can navigate to manage songs page', () => {
    cy.contains('Manage Songs').click()
    cy.url().should('include', '/admin/songs')
  })

  it('shows Add Song button on admin songs page', () => {
    cy.visit('/admin/songs')
    cy.contains('Add Song').should('be.visible')
  })

  it('can navigate to artists page', () => {
    cy.contains('Artists').click()
    cy.url().should('include', '/admin/artists')
  })

  it('can navigate to albums page', () => {
    cy.contains('Albums').click()
    cy.url().should('include', '/admin/albums')
  })

  it('can navigate to directors page', () => {
    cy.contains('Directors').click()
    cy.url().should('include', '/admin/directors')
  })

  it('can open Add Song modal', () => {
    cy.visit('/admin/songs')
    cy.contains('Add Song').click()
    cy.contains('Save Song').should('be.visible')
  })

})
