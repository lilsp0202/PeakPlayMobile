import { render, screen } from '@testing-library/react'
import OverallStats from '../OverallStats'

describe('OverallStats Component', () => {
  const mockSkillsData = {
    mental: 75,
    nutrition: 82,
    physical: 68,
    technical: 90,
  }

  describe('rendering', () => {
    it('should render all skill categories', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      expect(screen.getByText('Overall Performance')).toBeInTheDocument()
      expect(screen.getByText('Mental')).toBeInTheDocument()
      expect(screen.getByText('Nutrition')).toBeInTheDocument()
      expect(screen.getByText('Physical')).toBeInTheDocument()
      expect(screen.getByText('Technical')).toBeInTheDocument()
    })

    it('should display correct percentages', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('82%')).toBeInTheDocument()
      expect(screen.getByText('68%')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
    })

    it('should calculate and display correct average', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      const average = Math.round((75 + 82 + 68 + 90) / 4)
      expect(screen.getByText(`${average}%`)).toBeInTheDocument()
      expect(screen.getByText('Average')).toBeInTheDocument()
    })
  })

  describe('progress bar colors', () => {
    it('should use different colors for each skill', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      const mentalBar = screen.getByTestId('progress-bar-mental')
      const nutritionBar = screen.getByTestId('progress-bar-nutrition')
      const physicalBar = screen.getByTestId('progress-bar-physical')
      const technicalBar = screen.getByTestId('progress-bar-technical')
      
      expect(mentalBar).toHaveClass('bg-purple-500')
      expect(nutritionBar).toHaveClass('bg-green-500')
      expect(physicalBar).toHaveClass('bg-blue-500')
      expect(technicalBar).toHaveClass('bg-orange-500')
    })
  })

  describe('edge cases', () => {
    it('should handle all zero values', () => {
      const zeroData = {
        mental: 0,
        nutrition: 0,
        physical: 0,
        technical: 0,
      }
      
      render(<OverallStats skillsData={zeroData} />)
      
      const zeroElements = screen.getAllByText('0%')
      expect(zeroElements).toHaveLength(5) // 4 skills + average
    })

    it('should handle all 100% values', () => {
      const maxData = {
        mental: 100,
        nutrition: 100,
        physical: 100,
        technical: 100,
      }
      
      render(<OverallStats skillsData={maxData} />)
      
      const maxElements = screen.getAllByText('100%')
      expect(maxElements).toHaveLength(5) // 4 skills + average
    })

    it('should handle decimal values by rounding', () => {
      const decimalData = {
        mental: 75.7,
        nutrition: 82.3,
        physical: 68.9,
        technical: 90.1,
      }
      
      render(<OverallStats skillsData={decimalData} />)
      
      expect(screen.getByText('76%')).toBeInTheDocument()
      expect(screen.getByText('82%')).toBeInTheDocument()
      expect(screen.getByText('69%')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  describe('progress indicators', () => {
    it('should show improvement indicators for high values', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      // Technical has 90%, should show up arrow
      const technicalSection = screen.getByTestId('skill-technical')
      const upArrow = technicalSection.querySelector('.text-green-500')
      expect(upArrow).toBeInTheDocument()
    })

    it('should show warning indicators for low values', () => {
      const lowData = {
        mental: 45,
        nutrition: 82,
        physical: 38,
        technical: 90,
      }
      
      render(<OverallStats skillsData={lowData} />)
      
      // Physical has 38%, should show down arrow or warning
      const physicalSection = screen.getByTestId('skill-physical')
      const downArrow = physicalSection.querySelector('.text-red-500')
      expect(downArrow).toBeInTheDocument()
    })
  })

  describe('responsive design', () => {
    it('should have proper responsive classes', () => {
      const { container } = render(<OverallStats skillsData={mockSkillsData} />)
      
      const card = container.querySelector('.bg-white')
      expect(card).toHaveClass('rounded-xl', 'shadow-sm', 'p-6')
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-6')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<OverallStats skillsData={mockSkillsData} />)
      
      expect(screen.getByRole('region', { name: /overall performance/i })).toBeInTheDocument()
      
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars).toHaveLength(4)
      
      progressBars.forEach((bar, index) => {
        const skills = ['mental', 'nutrition', 'physical', 'technical']
        expect(bar).toHaveAttribute('aria-label', expect.stringContaining(skills[index]))
        expect(bar).toHaveAttribute('aria-valuenow')
        expect(bar).toHaveAttribute('aria-valuemin', '0')
        expect(bar).toHaveAttribute('aria-valuemax', '100')
      })
    })
  })

  describe('performance summary', () => {
    it('should show excellent performance message for high average', () => {
      const excellentData = {
        mental: 90,
        nutrition: 92,
        physical: 88,
        technical: 94,
      }
      
      render(<OverallStats skillsData={excellentData} />)
      
      expect(screen.getByText(/excellent performance/i)).toBeInTheDocument()
    })

    it('should show improvement needed message for low average', () => {
      const lowData = {
        mental: 45,
        nutrition: 52,
        physical: 38,
        technical: 50,
      }
      
      render(<OverallStats skillsData={lowData} />)
      
      expect(screen.getByText(/needs improvement/i)).toBeInTheDocument()
    })

    it('should show good performance message for medium average', () => {
      const mediumData = {
        mental: 70,
        nutrition: 75,
        physical: 68,
        technical: 72,
      }
      
      render(<OverallStats skillsData={mediumData} />)
      
      expect(screen.getByText(/good progress/i)).toBeInTheDocument()
    })
  })
}) 