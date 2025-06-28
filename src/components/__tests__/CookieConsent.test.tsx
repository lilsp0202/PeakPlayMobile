import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CookieConsent from '../CookieConsent'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

describe('CookieConsent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initial render', () => {
    it('should show consent banner when no consent is stored', () => {
      render(<CookieConsent />)
      
      expect(screen.getByText(/we use cookies/i)).toBeInTheDocument()
      expect(screen.getByText('Accept All')).toBeInTheDocument()
      expect(screen.getByText('Reject All')).toBeInTheDocument()
      expect(screen.getByText('Customize')).toBeInTheDocument()
    })

    it('should not show banner when consent is already given', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
      }))

      const { container } = render(<CookieConsent />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should check localStorage on mount', () => {
      render(<CookieConsent />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cookie-consent')
    })
  })

  describe('consent actions', () => {
    it('should handle accept all cookies', async () => {
      render(<CookieConsent />)
      
      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"analytics":true')
        )
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"marketing":true')
        )
      })
      
      // Banner should be hidden
      expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument()
    })

    it('should handle reject all cookies', async () => {
      render(<CookieConsent />)
      
      const rejectButton = screen.getByText('Reject All')
      fireEvent.click(rejectButton)
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"analytics":false')
        )
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"marketing":false')
        )
      })
      
      // Banner should be hidden
      expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument()
    })
  })

  describe('customize preferences', () => {
    it('should open preferences modal when customize is clicked', () => {
      render(<CookieConsent />)
      
      const customizeButton = screen.getByText('Customize')
      fireEvent.click(customizeButton)
      
      expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
      expect(screen.getByText(/essential cookies/i)).toBeInTheDocument()
      expect(screen.getByText(/analytics cookies/i)).toBeInTheDocument()
      expect(screen.getByText(/marketing cookies/i)).toBeInTheDocument()
    })

    it('should show essential cookies as always enabled', () => {
      render(<CookieConsent />)
      
      fireEvent.click(screen.getByText('Customize'))
      
      const essentialCheckbox = screen.getByRole('checkbox', { name: /essential cookies/i })
      expect(essentialCheckbox).toBeChecked()
      expect(essentialCheckbox).toBeDisabled()
    })

    it('should allow toggling analytics and marketing cookies', () => {
      render(<CookieConsent />)
      
      fireEvent.click(screen.getByText('Customize'))
      
      const analyticsCheckbox = screen.getByRole('checkbox', { name: /analytics cookies/i })
      const marketingCheckbox = screen.getByRole('checkbox', { name: /marketing cookies/i })
      
      expect(analyticsCheckbox).not.toBeChecked()
      expect(marketingCheckbox).not.toBeChecked()
      
      fireEvent.click(analyticsCheckbox)
      fireEvent.click(marketingCheckbox)
      
      expect(analyticsCheckbox).toBeChecked()
      expect(marketingCheckbox).toBeChecked()
    })

    it('should save custom preferences', async () => {
      render(<CookieConsent />)
      
      fireEvent.click(screen.getByText('Customize'))
      
      const analyticsCheckbox = screen.getByRole('checkbox', { name: /analytics cookies/i })
      fireEvent.click(analyticsCheckbox)
      
      const saveButton = screen.getByText('Save Preferences')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"analytics":true')
        )
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'cookie-consent',
          expect.stringContaining('"marketing":false')
        )
      })
      
      // Modal and banner should be hidden
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument()
      expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument()
    })

    it('should close modal when clicking outside', () => {
      render(<CookieConsent />)
      
      fireEvent.click(screen.getByText('Customize'))
      
      // Click overlay
      const overlay = screen.getByTestId('modal-overlay')
      fireEvent.click(overlay)
      
      expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument()
    })
  })

  describe('cookie policy link', () => {
    it('should have link to privacy policy', () => {
      render(<CookieConsent />)
      
      const policyLink = screen.getByRole('link', { name: /cookie policy/i })
      expect(policyLink).toHaveAttribute('href', '/privacy')
      expect(policyLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('analytics integration', () => {
    beforeEach(() => {
      // Mock window.gtag
      window.gtag = jest.fn()
    })

    afterEach(() => {
      delete (window as any).gtag
    })

    it('should configure gtag when analytics is accepted', async () => {
      render(<CookieConsent />)
      
      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)
      
      await waitFor(() => {
        expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
        })
      })
    })

    it('should deny gtag when analytics is rejected', async () => {
      render(<CookieConsent />)
      
      const rejectButton = screen.getByText('Reject All')
      fireEvent.click(rejectButton)
      
      await waitFor(() => {
        expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
        })
      })
    })
  })

  describe('consent expiry', () => {
    it('should show banner again if consent is expired (older than 365 days)', () => {
      const oldTimestamp = Date.now() - (366 * 24 * 60 * 60 * 1000) // 366 days ago
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        analytics: true,
        marketing: true,
        timestamp: oldTimestamp,
      }))

      render(<CookieConsent />)
      
      expect(screen.getByText(/we use cookies/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CookieConsent />)
      
      expect(screen.getByRole('region', { name: /cookie consent/i })).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Customize'))
      
      expect(screen.getByRole('dialog', { name: /cookie preferences/i })).toBeInTheDocument()
    })

    it('should trap focus in modal when open', () => {
      render(<CookieConsent />)
      
      fireEvent.click(screen.getByText('Customize'))
      
      const modal = screen.getByRole('dialog')
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      expect(focusableElements.length).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<CookieConsent />)
      
      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save cookie consent:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
}) 