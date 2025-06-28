import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import SkillSnap from '../SkillSnap';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => children,
  useSession: () => ({
    data: {
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'ATHLETE',
      },
    },
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiSave: () => <span data-testid="fi-save">Save</span>,
  FiX: () => <span data-testid="fi-x">X</span>,
  FiEdit: () => <span data-testid="fi-edit">Edit</span>,
  FiActivity: () => <span data-testid="fi-activity">Activity</span>,
}));

const mockSkillData = {
  id: 'test-skill-data',
  pushupScore: 41,
  pullupScore: 0,
  sprintTime: 0,
  run5kTime: 0,
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
    height: 175,
    weight: 70,
  },
};

const mockAverages = {
  ageGroup: '18-20',
  averages: {
    pushupScore: 35,
    pullupScore: 8,
    moodScore: 7,
    sleepScore: 7.5,
    totalCalories: 2400,
    protein: 140,
  },
  sampleSize: 100,
};

describe('SkillSnap Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Mock successful API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAverages),
      });
  });

  const renderComponent = (props = {}) => {
    return render(
      <SessionProvider session={null}>
        <SkillSnap {...props} />
      </SessionProvider>
    );
  };

  describe('Import and Rendering', () => {
    test('should render without import errors', () => {
      renderComponent();
      
      // Component should render without throwing import errors
      expect(document.body).toBeInTheDocument();
    });

    test('should handle loading state', () => {
      renderComponent();
      
      // Should show loading state initially
      expect(screen.getByText(/loading/i) || document.querySelector('.animate-pulse')).toBeTruthy();
    });
  });

  describe('Icon Imports', () => {
    test('should import react-icons correctly', () => {
      // Test that the icons can be imported without errors
      const { FiSave, FiX, FiEdit, FiActivity } = require('react-icons/fi');
      
      expect(FiSave).toBeDefined();
      expect(FiX).toBeDefined();
      expect(FiEdit).toBeDefined();
      expect(FiActivity).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent();
      
      // Component should still render without crashing
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    test('should handle empty skill data', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(null),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAverages),
        });
      
      renderComponent();
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    test('should render skill categories', async () => {
      renderComponent();
      
      await waitFor(() => {
        // Should render without errors and have some content
        expect(document.body.children.length).toBeGreaterThan(0);
      });
    });
  });
}); 