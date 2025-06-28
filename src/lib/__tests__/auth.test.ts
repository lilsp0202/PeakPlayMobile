import { authOptions } from '../auth'

describe('Auth Configuration', () => {
  it('should have correct session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('should have required providers', () => {
    expect(authOptions.providers).toBeDefined()
    expect(authOptions.providers.length).toBeGreaterThan(0)
  })

  it('should have required callbacks', () => {
    expect(authOptions.callbacks).toBeDefined()
    expect(authOptions.callbacks?.jwt).toBeDefined()
    expect(authOptions.callbacks?.session).toBeDefined()
  })

  it('should have correct pages configuration', () => {
    expect(authOptions.pages).toBeDefined()
    expect(authOptions.pages?.signIn).toBe('/auth/signin')
    expect(authOptions.pages?.signOut).toBe('/auth/signin')
    expect(authOptions.pages?.error).toBe('/auth/signin')
  })
}) 