describe('Playlists', () => {

  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@musiclibrary.com')
    cy.get('input[type="password"]').type('Admin@1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/library')    
    cy.visit('/playlists')                    
    cy.url().should('include', '/playlists')  
  })

  it('shows the playlists page', () => {
    cy.contains('My Playlists').should('be.visible')
  })

  it('shows New Playlist button', () => {
    cy.contains('+ New Playlist').should('be.visible')
  })

  it('can open the create playlist modal', () => {
    cy.contains('+ New Playlist').click()
    cy.get('input[placeholder="My Awesome Playlist"]').should('be.visible')
  })

  it('can create a new playlist', () => {
    cy.contains('+ New Playlist').click()
    cy.get('input[placeholder="My Awesome Playlist"]')
      .type('Cypress Test Playlist')
    cy.contains('Save').click()
    cy.contains('Cypress Test Playlist').should('be.visible')
  })

  it('can cancel playlist creation', () => {
    cy.contains('+ New Playlist').click()
    cy.get('input[placeholder="My Awesome Playlist"]')
      .type('Cancel This')
    cy.contains('Cancel').click()
    cy.contains('Cancel This').should('not.exist')
  })

})
