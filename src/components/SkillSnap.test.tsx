import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillSnap from './SkillSnap';

describe('SkillSnap Modal Positioning', () => {
  beforeEach(() => {
    // Mock window dimensions for iPhone 12
    global.innerWidth = 390;
    global.innerHeight = 844;
  });

  it('should render modal with equidistant spacing from all sides', () => {
    const { container } = render(<SkillSnap />);
    
    // Open the modal
    const physicalCard = screen.getByText('Physical');
    fireEvent.click(physicalCard);

    // Get the modal elements
    const modalOverlay = container.querySelector('.fixed.bg-black\\/80');
    const modalContainer = container.querySelector('[role="dialog"]');
    
    // Check overlay positioning
    expect(modalOverlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    });

    // Check modal container positioning
    expect(modalContainer).toHaveStyle({
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '92%',
      maxWidth: '22rem',
      margin: '0 auto',
      borderRadius: '1rem'
    });
  });

  it('should maintain equidistant spacing for all skill category modals', async () => {
    const { container } = render(<SkillSnap />);
    
    // Test each category modal
    const categories = ['Physical', 'Mental', 'Nutrition', 'Technical'];
    
    for (const category of categories) {
      const card = screen.getByText(category);
      fireEvent.click(card);
      
      const modalContainer = container.querySelector('[role="dialog"]');
      
      expect(modalContainer).toHaveStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '92%',
        maxWidth: '22rem'
      });

      // Close modal before testing next category
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
    }
  });
}); 