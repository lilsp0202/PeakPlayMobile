import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import SkillSnap from '../SkillSnap';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'test-user' } }, status: 'authenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiActivity: () => <span data-testid="fi-activity">Activity</span>,
  FiSave: () => <span data-testid="fi-save">Save</span>,
  FiX: () => <span data-testid="fi-x">X</span>,
  FiEdit: () => <span data-testid="fi-edit">Edit</span>,
}));

// Mock window.scrollTo
global.scrollTo = jest.fn();

const mockSkillData = {
  id: 'test-skill-data',
  pushupScore: 41,
  pullupScore: 10,
  sprintTime: 15,
  run5kTime: 25,
  moodScore: 8,
  sleepScore: 7,
  totalCalories: 2500,
  protein: 150,
  carbohydrates: 300,
  fats: 80,
  student: {
    studentName: 'Test Student',
    age: 18,
    academy: 'Test Academy',
    height: 170,
    weight: 70,
  },
};

describe('SkillSnap Modal Behavior', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful API responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/student/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSkillData),
        });
      }
      if (url.includes('/api/skills/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ageGroup: '16-20',
            averages: {
              pushupScore: 35,
              pullupScore: 8,
              sprintTime: 16,
              run5kTime: 28,
            },
            sampleSize: 50,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Clear body classes
    document.body.className = '';
  });

  afterEach(() => {
    // Ensure body classes are cleaned up
    document.body.classList.remove('modal-open');
  });

  it('should open modal with proper full-screen coverage', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });
    
    const physicalCard = screen.getByText('Physical').closest('div[class*="card-gradient"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      // Check background overlay
      const overlay = document.querySelector('div[class*="bg-black bg-opacity-80"]');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-[9998]');
      
      // Check modal container structure
      const modalContainer = document.querySelector('div[class*="fixed inset-0 z-[9999]"]');
      expect(modalContainer).toBeInTheDocument();
      
      // Check modal content with flex column layout
      const modalContent = document.querySelector('div[class*="w-full h-full bg-white flex flex-col"]');
      expect(modalContent).toBeInTheDocument();
      
      // Check scrollable content area
      const scrollableContent = document.querySelector('div[class*="flex-1 overflow-y-auto custom-scrollbar"]');
      expect(scrollableContent).toBeInTheDocument();
      
      // Check close button positioning
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toHaveClass('absolute', 'top-4', 'right-4', 'z-[10000]');
    });
  });

  it('should lock body scroll when modal opens', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });

    // Initially body should not have modal-open class
    expect(document.body).not.toHaveClass('modal-open');

    // Open modal
    const physicalCard = screen.getByText('Physical').closest('div[class*="cursor-pointer"]');
    fireEvent.click(physicalCard!);

    // Body should have modal-open class
    await waitFor(() => {
      expect(document.body).toHaveClass('modal-open');
    });
  });

  it('should unlock body scroll when modal closes', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });

    // Open modal
    const physicalCard = screen.getByText('Physical').closest('div[class*="cursor-pointer"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      expect(document.body).toHaveClass('modal-open');
    });

    // Close modal
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    // Body should not have modal-open class
    await waitFor(() => {
      expect(document.body).not.toHaveClass('modal-open');
    });
  });

  it('should close modal when clicking overlay', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });
    
    const physicalCard = screen.getByText('Physical').closest('div[class*="card-gradient"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    // Click overlay
    const overlay = document.querySelector('div[class*="bg-black bg-opacity-80"]');
    fireEvent.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  it('should have proper z-index layering', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });

    // Open modal
    const physicalCard = screen.getByText('Physical').closest('div[class*="cursor-pointer"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      // Check z-index hierarchy
      const overlay = document.querySelector('div[class*="z-\\[9998\\]"]');
      const modalContainer = document.querySelector('div[class*="z-\\[9999\\]"]');
      const closeButton = document.querySelector('button[class*="z-\\[10000\\]"]');

      expect(overlay).toBeInTheDocument();
      expect(modalContainer).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });
  });

  it('should maintain modal position regardless of parent scroll', async () => {
    // Create a scrollable parent
    document.body.style.height = '200vh';
    
    const { container } = render(
      <div style={{ paddingTop: '1000px' }}>
        <SessionProvider>
          <SkillSnap />
        </SessionProvider>
      </div>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });

    // Scroll down
    window.scrollTo(0, 1000);

    const physicalCard = screen.getByText('Physical').closest('div[class*="card-gradient"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      // Modal should cover entire viewport
      const overlay = document.querySelector('div[class*="bg-black bg-opacity-80"]');
      expect(overlay).toHaveClass('fixed', 'inset-0');
      
      // Modal container should be fixed position
      const modalContainer = document.querySelector('div[class*="fixed inset-0 z-[9999]"]');
      expect(modalContainer).toBeInTheDocument();
      
      // Close button should be at absolute position within the modal
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toHaveClass('absolute', 'top-4', 'right-4');
    });

    // Reset
    document.body.style.height = '';
    window.scrollTo(0, 0);
  });

  it('should handle individual skill modal correctly', async () => {
    render(
      <SessionProvider>
        <SkillSnap />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Physical')).toBeInTheDocument();
    });

    // Open category modal first
    const physicalCard = screen.getByText('Physical').closest('div[class*="cursor-pointer"]');
    fireEvent.click(physicalCard!);

    await waitFor(() => {
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
    });

    // Click on a skill
    const pushupSkill = screen.getByText('Push-ups').closest('div[class*="cursor-pointer"]');
    fireEvent.click(pushupSkill!);

    await waitFor(() => {
      // Should show individual skill modal
      expect(screen.getByText('Skill Development Tracking')).toBeInTheDocument();
      
      // Should still have proper modal structure
      const overlay = document.querySelector('div[class*="fixed inset-0 z-\\[9998\\]"]');
      expect(overlay).toBeInTheDocument();
      
      // Body should still be locked
      expect(document.body).toHaveClass('modal-open');
    });
  });
}); 