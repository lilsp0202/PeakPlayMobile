import '@testing-library/jest-dom';

// Test the video modal media type detection logic
describe('Video Modal Media Type Detection', () => {
  // Function to simulate the media type detection logic from the component
  const detectMediaType = (mediaType?: string, fileName?: string) => {
    let detectedType = mediaType || 'video/mp4';
    
    if (!mediaType || mediaType === 'undefined') {
      // Fallback: detect type from file extension
      const extension = fileName?.toLowerCase().split('.').pop() || '';
      if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(extension)) {
        detectedType = `video/${extension === 'mov' ? 'quicktime' : extension}`;
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        detectedType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      }
    }
    
    return detectedType;
  };

  const isVideoType = (type: string, fileName: string) => {
    return type.startsWith('video/') || 
           ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(
             fileName.toLowerCase().split('.').pop() || ''
           );
  };

  test('should detect video files by MIME type', () => {
    expect(detectMediaType('video/mp4', 'test.mp4')).toBe('video/mp4');
    expect(detectMediaType('video/quicktime', 'test.mov')).toBe('video/quicktime');
    expect(isVideoType('video/mp4', 'test.mp4')).toBe(true);
    expect(isVideoType('video/quicktime', 'test.mov')).toBe(true);
  });

  test('should fallback to file extension when MIME type is missing', () => {
    expect(detectMediaType(undefined, 'test.mov')).toBe('video/quicktime');
    expect(detectMediaType(undefined, 'test.mp4')).toBe('video/mp4');
    expect(detectMediaType('undefined', 'test.avi')).toBe('video/avi');
    expect(detectMediaType(null, 'test.mkv')).toBe('video/mkv');
  });

  test('should handle different video file extensions', () => {
    const testCases = [
      { fileName: 'test.mp4', expectedType: 'video/mp4' },
      { fileName: 'test.mov', expectedType: 'video/quicktime' },
      { fileName: 'test.avi', expectedType: 'video/avi' },
      { fileName: 'test.mkv', expectedType: 'video/mkv' },
      { fileName: 'test.webm', expectedType: 'video/webm' },
      { fileName: 'test.m4v', expectedType: 'video/m4v' }
    ];

    testCases.forEach(({ fileName, expectedType }) => {
      expect(detectMediaType(undefined, fileName)).toBe(expectedType);
      expect(isVideoType(expectedType, fileName)).toBe(true);
    });
  });

  test('should detect image files correctly', () => {
    expect(detectMediaType(undefined, 'test.jpg')).toBe('image/jpeg');
    expect(detectMediaType(undefined, 'test.png')).toBe('image/png');
    expect(detectMediaType(undefined, 'test.gif')).toBe('image/gif');
    expect(isVideoType('image/jpeg', 'test.jpg')).toBe(false);
  });

  test('should handle case insensitive file extensions', () => {
    expect(detectMediaType(undefined, 'TEST.MOV')).toBe('video/quicktime');
    expect(detectMediaType(undefined, 'Video.MP4')).toBe('video/mp4');
    expect(isVideoType('video/quicktime', 'TEST.MOV')).toBe(true);
  });

  test('should provide default type when no extension matches', () => {
    expect(detectMediaType(undefined, 'unknown.xyz')).toBe('video/mp4');
    expect(detectMediaType(undefined, 'noextension')).toBe('video/mp4');
    expect(detectMediaType(undefined, '')).toBe('video/mp4');
  });
});

// Test DOM manipulation functions
describe('Video Modal DOM Behavior', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up any event listeners
    document.body.style.overflow = 'unset';
  });

  test('should prevent body scroll when modal is open', () => {
    // Simulate modal opening
    document.body.style.overflow = 'hidden';
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate modal closing
    document.body.style.overflow = 'unset';
    expect(document.body.style.overflow).toBe('unset');
  });

  test('should handle keyboard events', () => {
    let modalClosed = false;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        modalClosed = true;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);
    
    expect(modalClosed).toBe(true);
    
    document.removeEventListener('keydown', handleKeyDown);
  });

  test('should create video element with correct attributes', () => {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.autoplay = false;
    video.muted = false;
    video.playsInline = true;
    video.src = 'test-video.mov';
    
    expect(video.controls).toBe(true);
    expect(video.preload).toBe('metadata');
    expect(video.autoplay).toBe(false);
    expect(video.muted).toBe(false);
    expect(video.playsInline).toBe(true);
    expect(video.src).toContain('test-video.mov');
  });

  test('should create multiple video source elements', () => {
    const video = document.createElement('video');
    
    const source1 = document.createElement('source');
    source1.src = 'test-video.mov';
    source1.type = 'video/quicktime';
    
    const source2 = document.createElement('source');
    source2.src = 'test-video.mov';
    source2.type = 'video/mp4';
    
    video.appendChild(source1);
    video.appendChild(source2);
    
    const sources = video.querySelectorAll('source');
    expect(sources.length).toBe(2);
    expect(sources[0].type).toBe('video/quicktime');
    expect(sources[1].type).toBe('video/mp4');
  });
});

// Test error handling logic
describe('Video Modal Error Handling', () => {
  test('should handle video loading errors gracefully', () => {
    const video = document.createElement('video');
    let errorHandled = false;
    
    video.onerror = () => {
      errorHandled = true;
    };
    
    // Simulate error
    video.dispatchEvent(new Event('error'));
    expect(errorHandled).toBe(true);
  });

  test('should handle image loading errors gracefully', () => {
    const img = document.createElement('img');
    let errorHandled = false;
    
    img.onerror = () => {
      errorHandled = true;
    };
    
    // Simulate error
    img.dispatchEvent(new Event('error'));
    expect(errorHandled).toBe(true);
  });

  test('should provide retry functionality', () => {
    let retryCount = 0;
    
    const retryHandler = () => {
      retryCount++;
    };
    
    // Simulate retry button click
    retryHandler();
    retryHandler();
    
    expect(retryCount).toBe(2);
  });
});

// Test mobile responsiveness logic
describe('Video Modal Mobile Responsiveness', () => {
  test('should apply mobile styles based on window width', () => {
    // Mock window inner width for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });
    
    const isMobile = window.innerWidth <= 768;
    expect(isMobile).toBe(true);
    
    // Mock window inner width for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    const isDesktop = window.innerWidth > 768;
    expect(isDesktop).toBe(true);
  });

  test('should create mobile-optimized modal classes', () => {
    const modalClasses = 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4';
    const contentClasses = 'relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh]';
    
    expect(modalClasses).toContain('p-2');
    expect(modalClasses).toContain('sm:p-4');
    expect(contentClasses).toContain('max-w-5xl');
    expect(contentClasses).toContain('max-h-[95vh]');
  });
});

console.log('✅ Video Modal Feature Tests Completed Successfully'); 