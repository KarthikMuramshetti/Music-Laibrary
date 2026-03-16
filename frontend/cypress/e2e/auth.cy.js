describe('Authentication', () => {

  it('shows login page', () => {
    cy.visit('/login')
    cy.contains('Sign in').should('be.visible')
  })

  it('shows error for wrong credentials', () => {
  cy.visit('/login')
  cy.get('input[type="email"]').type('wrong@email.com')
  cy.get('input[type="password"]').type('wrongpassword')
  cy.get('button[type="submit"]').click()
  cy.get('.go2072408551')                             
    .should('be.visible')
})

  it('redirects to library after successful login', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@musiclibrary.com')
    cy.get('input[type="password"]').type('Admin@1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/library')
  })

  it('shows register page', () => {
    cy.visit('/register')
    cy.contains('Create account').should('be.visible')
  })

})
