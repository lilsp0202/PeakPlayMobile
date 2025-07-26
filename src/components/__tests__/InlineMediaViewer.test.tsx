import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InlineMediaViewer from '../InlineMediaViewer';

// Mock fetch globally
global.fetch = jest.fn();

// Mock intersection observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

describe('InlineMediaViewer', () => {
  const mockProps = {
    actionId: 'test-action-1',
    mediaType: 'demo' as const,
    fileName: 'test-video.mp4',
    fileSize: 1024000,
    mediaFileType: 'video/mp4',
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Initial Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<InlineMediaViewer {...mockProps} isOpen={false} />);
      expect(screen.queryByRole('button', { name: /close media viewer/i })).not.toBeInTheDocument();
    });

    it('should render header with correct title for demo media', () => {
      render(<InlineMediaViewer {...mockProps} />);
      expect(screen.getByText('Coach Demo Media')).toBeInTheDocument();
    });

    it('should render header with correct title for proof media', () => {
      render(<InlineMediaViewer {...mockProps} mediaType="proof" />);
      expect(screen.getByText('Student Proof Submission')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<InlineMediaViewer {...mockProps} />);
      expect(screen.getByText(/loading demo media/i)).toBeInTheDocument();
    });
  });

  describe('Media Loading', () => {
    const mockMediaResponse = {
      demoMedia: {
        url: 'https://test-url.com/video.mp4',
        type: 'video/mp4',
        fileName: 'test-video.mp4',
        fileSize: 1024000,
      },
      performance: {
        totalTime: 150,
      },
    };

    it('should fetch media when opened', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/actions/test-action-1/media', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
          },
          signal: expect.any(AbortSignal),
        });
      });
    });

    it('should display video player when media loads successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        const videoElement = screen.getByRole('application') || screen.querySelector('video');
        expect(videoElement).toBeInTheDocument();
      });
    });

    it('should display image when media type is image', async () => {
      const imageResponse = {
        demoMedia: {
          url: 'https://test-url.com/image.jpg',
          type: 'image/jpeg',
          fileName: 'test-image.jpg',
          fileSize: 512000,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => imageResponse,
      });

      render(<InlineMediaViewer {...mockProps} mediaFileType="image/jpeg" />);

      await waitFor(() => {
        const imageElement = screen.getByAltText('test-video.mp4');
        expect(imageElement).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when API returns 401', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/please log in again to view media/i)).toBeInTheDocument();
      });
    });

    it('should show error when API returns 404', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/demo video not available/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            demoMedia: {
              url: 'https://test-url.com/video.mp4',
              type: 'video/mp4',
              fileName: 'test-video.mp4',
              fileSize: 1024000,
            },
          }),
        });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use correct video attributes for performance', async () => {
      const mockMediaResponse = {
        demoMedia: {
          url: 'https://test-url.com/video.mp4',
          type: 'video/mp4',
          fileName: 'test-video.mp4',
          fileSize: 1024000,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        const videoElement = screen.querySelector('video');
        expect(videoElement).toHaveAttribute('preload', 'none');
        expect(videoElement).toHaveAttribute('controls');
      });
    });

    it('should use lazy loading for images', async () => {
      const imageResponse = {
        demoMedia: {
          url: 'https://test-url.com/image.jpg',
          type: 'image/jpeg',
          fileName: 'test-image.jpg',
          fileSize: 512000,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => imageResponse,
      });

      render(<InlineMediaViewer {...mockProps} mediaFileType="image/jpeg" />);

      await waitFor(() => {
        const imageElement = screen.getByAltText('test-video.mp4');
        expect(imageElement).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should abort previous requests when component unmounts', () => {
      const { unmount } = render(<InlineMediaViewer {...mockProps} />);
      
      // Spy on AbortController
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      
      unmount();
      
      expect(abortSpy).toHaveBeenCalled();
      
      abortSpy.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onCloseMock = jest.fn();
      render(<InlineMediaViewer {...mockProps} onClose={onCloseMock} />);

      const closeButton = screen.getByRole('button', { name: /close media viewer/i });
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should show download link when media loads', async () => {
      const mockMediaResponse = {
        demoMedia: {
          url: 'https://test-url.com/video.mp4',
          type: 'video/mp4',
          fileName: 'test-video.mp4',
          fileSize: 1024000,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaResponse,
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        const downloadLink = screen.getByRole('link', { name: /download/i });
        expect(downloadLink).toHaveAttribute('href', 'https://test-url.com/video.mp4');
        expect(downloadLink).toHaveAttribute('download', 'test-video.mp4');
      });
    });

    it('should display file size information', async () => {
      render(<InlineMediaViewer {...mockProps} fileSize={2048000} />);

      // File size should be displayed in header
      expect(screen.getByText(/\(2000KB\)/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on close button', () => {
      render(<InlineMediaViewer {...mockProps} />);
      
      const closeButton = screen.getByLabelText('Close media viewer');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper alt text on images', async () => {
      const imageResponse = {
        demoMedia: {
          url: 'https://test-url.com/image.jpg',
          type: 'image/jpeg',
          fileName: 'test-image.jpg',
          fileSize: 512000,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => imageResponse,
      });

      render(<InlineMediaViewer {...mockProps} mediaFileType="image/jpeg" />);

      await waitFor(() => {
        const imageElement = screen.getByAltText('test-video.mp4');
        expect(imageElement).toBeInTheDocument();
      });
    });
  });

  describe('Cache Control', () => {
    it('should include cache control headers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          demoMedia: {
            url: 'https://test-url.com/video.mp4',
            type: 'video/mp4',
            fileName: 'test-video.mp4',
          },
        }),
      });

      render(<InlineMediaViewer {...mockProps} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/actions/test-action-1/media',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Cache-Control': 'public, max-age=300',
            }),
          })
        );
      });
    });
  });
}); 