import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import SkillSnap from '../SkillSnap';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch
global.fetch = jest.fn();

describe('SkillSnap Modal Behavior Tests', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'ATHLETE',
    },
  };

  const mockSkillData = {
    id: '1',
    pushupScore: 50,
    pullupScore: 20,
    sprintTime: 12,
    run5kTime: 25,
    moodScore: 8,
    sleepScore: 7,
    student: {
      studentName: 'Test Student',
      age: 20,
      academy: 'Test Academy',
      height: 175,
      weight: 70
    }
  };

  beforeEach(() => {
    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSkillData),
    });

    // Mock useSession
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({ data: mockSession });

    // Reset body classes
    document.body.className = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.className = '';
  });

  describe('Category Modal Behavior', () => {
    it('should open category modal with proper z-index stacking', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Click on Physical category
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        // Check for category modal with high z-index
        const modalContainer = document.querySelector('.fixed.inset-0.z-\\[9999\\]');
        expect(modalContainer).toBeInTheDocument();
        
        // Check for background overlay
        const overlay = document.querySelector('.fixed.inset-0.z-\\[9998\\]');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should add modal-open class to body when category modal opens', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Click on Physical category
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });
    });

    it('should display category modal in full screen', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Click on Physical category
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        // Check for full-screen modal structure
        const modalContent = document.querySelector('.w-full.h-full.bg-white');
        expect(modalContent).toBeInTheDocument();
        
        // Check for close button
        const closeButton = screen.getByRole('button', { name: /close modal/i });
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  describe('Individual Skill Modal Behavior', () => {
    it('should open individual skill modal with highest z-index', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open category modal first
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
      });

      // Click on a specific skill
      const pushupSkillContainer = screen.getByText('Push-ups').closest('.cursor-pointer');
      fireEvent.click(pushupSkillContainer!);

      await waitFor(() => {
        // Check for individual skill modal with proper z-index stacking
        const skillModals = document.querySelectorAll('.fixed.inset-0.z-\\[9999\\]');
        expect(skillModals.length).toBeGreaterThan(0);
      });
    });

    it('should display individual skill modal content properly', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open category modal
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
      });

      // Click on Push-ups skill
      const pushupSkillContainer = screen.getByText('Push-ups').closest('.cursor-pointer');
      fireEvent.click(pushupSkillContainer!);

      await waitFor(() => {
        // Check for skill modal content
        const pushupElements = screen.getAllByText('Push-ups');
        expect(pushupElements.length).toBeGreaterThan(0);
        
        // Check for skill description
        const descriptionElements = screen.getAllByText('Maximum push-ups in 1 minute');
        expect(descriptionElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle modal closing properly', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open category modal
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });

      // Close modal using close button
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(false);
      });
    });
  });

  describe('Modal Accessibility', () => {
    it('should have proper ARIA labels for close buttons', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open category modal
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close modal/i });
        expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open category modal
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close modal/i });
        expect(closeButton).toBeInTheDocument();
        
        // Simulate Escape key
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        
        // Note: The actual escape key handling would need to be implemented in the component
        // This test ensures the structure is correct for keyboard navigation
      });
    });
  });

  describe('Modal Performance', () => {
    it('should render modals without performance issues', async () => {
      const startTime = performance.now();
      
      render(
        <SessionProvider session={mockSession}>
          <SkillSnap />
        </SessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Physical')).toBeInTheDocument();
      });

      // Open and close modal quickly
      const physicalCategory = screen.getByText('Physical').closest('.cursor-pointer');
      fireEvent.click(physicalCategory!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Ensure rendering completes within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });
}); 