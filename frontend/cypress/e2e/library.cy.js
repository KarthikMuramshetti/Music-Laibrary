describe('Music Library', () => {

  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@musiclibrary.com')
    cy.get('input[type="password"]').type('Admin@1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/library')
  })

  it('shows the library page heading', () => {
    cy.contains('Music Library').should('be.visible')
  })

  it('search box is visible', () => {
    cy.get('input[placeholder="Search songs…"]').should('be.visible')
  })

  it('can type in the search box', () => {
    cy.get('input[placeholder="Search songs…"]').type('Rana')
    cy.wait(500)
  })

  it('shows sidebar navigation links', () => {
    cy.contains('Library').should('be.visible')
    cy.contains('My Playlists').should('be.visible')
    cy.contains('Notifications').should('be.visible')
    cy.contains('Profile').should('be.visible')
  })

  it('can navigate to playlists page', () => {
    cy.contains('My Playlists').click()
    cy.url().should('include', '/playlists')
  })

  it('can navigate to profile page', () => {
    cy.contains('Profile').click()
    cy.url().should('include', '/profile')
  })

})
